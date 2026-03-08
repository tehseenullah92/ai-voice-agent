import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import {
  getOrCreateAuthenticatedUser,
  unauthorizedJsonResponse,
} from "../../../../../lib/server-auth";

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getOrCreateAuthenticatedUser(req);
    if (!user) return unauthorizedJsonResponse();

    const { id: campaignId } = await ctx.params;
    const body = await req.json().catch(() => ({}));
    const { clientIds = [], clientListId } = body as {
      clientIds?: string[];
      clientListId?: string;
    };

    const campaign = await prisma.campaign.findFirst({
      where: { id: campaignId, userId: user.id },
    });
    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    let idsToAdd: string[] = Array.isArray(clientIds) ? [...clientIds] : [];

    if (clientListId) {
      const list = await prisma.clientList.findFirst({
        where: { id: clientListId, userId: user.id },
        include: { memberships: { select: { clientId: true } } },
      });
      if (list) {
        idsToAdd = [...new Set([...idsToAdd, ...list.memberships.map((m) => m.clientId)])];
      }
    }

    if (idsToAdd.length === 0) {
      return NextResponse.json(
        { error: "Provide clientIds or clientListId" },
        { status: 400 }
      );
    }

    const clients = await prisma.client.findMany({
      where: { id: { in: idsToAdd }, userId: user.id },
    });

    const existingCalls = await prisma.call.findMany({
      where: { campaignId },
      select: { clientId: true, clientPhone: true },
    });
    const existingIds = new Set(existingCalls.map((c) => c.clientId).filter(Boolean));
    const existingPhones = new Set(existingCalls.map((c) => c.clientPhone).filter(Boolean));

    const toCreate = clients.filter(
      (c) => !existingIds.has(c.id) && !existingPhones.has(c.phone)
    );

    if (toCreate.length === 0) {
      return NextResponse.json({
        ok: true,
        created: 0,
        message: "All clients already in queue",
      });
    }

    await prisma.call.createMany({
      data: toCreate.map((c) => ({
        campaignId,
        clientId: c.id,
        clientName: c.name,
        clientPhone: c.phone,
        status: "pending" as const,
      })),
    });

    const newTotal = existingCalls.length + toCreate.length;
    await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        totalClients: newTotal,
        remaining: newTotal - campaign.called,
      },
    });

    return NextResponse.json({
      ok: true,
      created: toCreate.length,
      totalClients: newTotal,
    });
  } catch (err) {
    console.error("POST /api/campaigns/[id]/calls error", err);
    return NextResponse.json({ error: "Failed to add clients" }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getOrCreateAuthenticatedUser(req);
    if (!user) return unauthorizedJsonResponse();

    const { id: campaignId } = await ctx.params;

    // Verify campaign belongs to user
    const campaign = await prisma.campaign.findFirst({
      where: { id: campaignId, userId: user.id },
    });
    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const calls = await prisma.call.findMany({
      where: {
        campaignId,
        ...(status ? { status: status as "pending" | "in_progress" | "completed" | "failed" | "no_answer" } : {}),
      },
      orderBy: { createdAt: "desc" },
    });

    const shaped = calls.map((c) => ({
      id: c.id,
      campaignId: c.campaignId,
      clientId: c.clientId,
      clientName: c.clientName,
      clientPhone: c.clientPhone,
      status: c.status,
      duration: c.duration,
      outcome: c.outcome,
      notes: c.notes,
      recordingUrl: c.recordingUrl,
      transcript: c.transcript,
      createdAt: c.createdAt.toISOString(),
      completedAt: c.completedAt?.toISOString() ?? null,
    }));

    return NextResponse.json({ calls: shaped });
  } catch (err) {
    console.error("GET /api/campaigns/[id]/calls error", err);
    return NextResponse.json({ error: "Failed to load calls" }, { status: 500 });
  }
}
