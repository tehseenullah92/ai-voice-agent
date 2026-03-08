import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import {
  getOrCreateAuthenticatedUser,
  unauthorizedJsonResponse,
} from "../../../../../lib/server-auth";

export async function POST(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getOrCreateAuthenticatedUser(_req);
    if (!user) return unauthorizedJsonResponse();

    const { id: campaignId } = await ctx.params;

    const campaign = await prisma.campaign.findFirst({
      where: { id: campaignId, userId: user.id },
    });
    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    const clientListId = campaign.clientListKey;
    if (!clientListId) {
      return NextResponse.json(
        { error: "Campaign has no client list. Add a client list first." },
        { status: 400 }
      );
    }

    const clientList = await prisma.clientList.findFirst({
      where: { id: clientListId, userId: user.id },
      include: { memberships: { include: { client: true } } },
    });
    if (!clientList || clientList.memberships.length === 0) {
      return NextResponse.json(
        { error: "Client list is empty. Add clients to the list first." },
        { status: 400 }
      );
    }

    const existingCalls = await prisma.call.findMany({
      where: { campaignId },
      select: { clientId: true, clientPhone: true },
    });
    const existingClientIds = new Set(
      existingCalls.map((c) => c.clientId).filter(Boolean)
    );
    const existingPhones = new Set(
      existingCalls.map((c) => c.clientPhone).filter(Boolean)
    );

    const toCreate = clientList.memberships.filter(
      (m) =>
        !existingClientIds.has(m.client.id) && !existingPhones.has(m.client.phone)
    );

    if (toCreate.length === 0) {
      return NextResponse.json({
        ok: true,
        created: 0,
        message: "All clients already have call records.",
      });
    }

    await prisma.call.createMany({
      data: toCreate.map((m) => ({
        campaignId,
        clientId: m.client.id,
        clientName: m.client.name,
        clientPhone: m.client.phone,
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
    console.error("POST /api/campaigns/[id]/populate-calls error", err);
    return NextResponse.json({ error: "Failed to populate calls" }, { status: 500 });
  }
}
