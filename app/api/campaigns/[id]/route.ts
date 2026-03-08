import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import {
  getOrCreateAuthenticatedUser,
  unauthorizedJsonResponse,
} from "../../../../lib/server-auth";
import { autoPopulateCalls } from "../../../../lib/campaign-populate";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getOrCreateAuthenticatedUser(_req);
    if (!user) return unauthorizedJsonResponse();

    const { id } = await ctx.params;
    const campaign = await prisma.campaign.findFirst({
      where: { id, userId: user.id },
      include: {
        listLinks: {
          include: { clientList: true },
        },
      },
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    let clientListName: string | null =
      campaign.listLinks[0]?.clientList?.name ?? null;
    if (!clientListName && campaign.clientListKey) {
      const list = await prisma.clientList.findFirst({
        where: { id: campaign.clientListKey, userId: user.id },
      });
      clientListName = list?.name ?? null;
    }

    const shaped = {
      id: campaign.id,
      name: campaign.name,
      project: campaign.project,
      language: campaign.language,
      concurrency: campaign.concurrency,
      totalClients: campaign.totalClients,
      called: campaign.called,
      remaining: campaign.remaining,
      interested: campaign.interested,
      status: campaign.status,
      createdAt: campaign.createdAt.toISOString().split("T")[0],
      clientListKey: campaign.clientListKey,
      clientListName,
    };

    return NextResponse.json({ campaign: shaped });
  } catch (err) {
    console.error("GET /api/campaigns/[id] error", err);
    return NextResponse.json({ error: "Failed to load campaign" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getOrCreateAuthenticatedUser(req);
    if (!user) return unauthorizedJsonResponse();

    const { id } = await ctx.params;
    const body = await req.json();
    const { name, project, language, concurrency, clientList } = body;

    if (!name || !project) {
      return NextResponse.json(
        { error: "Campaign name and project are required" },
        { status: 400 }
      );
    }

    const updateResult = await prisma.campaign.updateMany({
      where: { id, userId: user.id },
      data: {
        name,
        project,
        language,
        concurrency: concurrency ? Number(concurrency) : undefined,
        clientListKey: typeof clientList === "string" && clientList.length > 0 ? clientList : null,
      },
    });

    if (updateResult.count === 0) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    const clientListId = typeof clientList === "string" && clientList.length > 0 ? clientList : null;
    if (clientListId) {
      await autoPopulateCalls(prisma, id, user.id);
    }

    const updated = await prisma.campaign.findFirst({ where: { id, userId: user.id } });
    if (!updated) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    return NextResponse.json({ campaign: updated });
  } catch (err) {
    console.error("PUT /api/campaigns/[id] error", err);
    return NextResponse.json({ error: "Failed to update campaign" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getOrCreateAuthenticatedUser(req);
    if (!user) return unauthorizedJsonResponse();

    const { id } = await ctx.params;
    const body = await req.json();

    const updateResult = await prisma.campaign.updateMany({
      where: { id, userId: user.id },
      data: body,
    });

    if (updateResult.count === 0) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    const updated = await prisma.campaign.findFirst({ where: { id, userId: user.id } });
    if (!updated) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    return NextResponse.json({ campaign: updated });
  } catch (err) {
    console.error("PATCH /api/campaigns/[id] error", err);
    return NextResponse.json({ error: "Failed to update campaign" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getOrCreateAuthenticatedUser(_req);
    if (!user) return unauthorizedJsonResponse();

    const { id } = await ctx.params;
    const deleted = await prisma.campaign.deleteMany({ where: { id, userId: user.id } });
    if (deleted.count === 0) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/campaigns/[id] error", err);
    return NextResponse.json({ error: "Failed to delete campaign" }, { status: 500 });
  }
}

