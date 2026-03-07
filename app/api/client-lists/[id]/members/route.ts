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

    const { id } = await ctx.params;

    const body = await req.json();
    const { clientId } = body as { clientId?: string };
    if (!clientId) {
      return NextResponse.json({ error: "clientId is required" }, { status: 400 });
    }

    const [list, client] = await Promise.all([
      prisma.clientList.findFirst({ where: { id, userId: user.id } }),
      prisma.client.findFirst({ where: { id: clientId, userId: user.id } }),
    ]);
    if (!list || !client) {
      return NextResponse.json({ error: "List or client not found" }, { status: 404 });
    }

    const membership = await prisma.clientListMembership.create({
      data: {
        clientId,
        listId: id,
      },
    });

    return NextResponse.json({ membership });
  } catch (err: any) {
    // If the membership already exists (unique constraint), treat as success.
    if (err && typeof err === "object" && (err as any).code === "P2002") {
      return NextResponse.json({ ok: true, alreadyMember: true });
    }
    console.error("POST /api/client-lists/[id]/members error", err);
    return NextResponse.json({ error: "Failed to add client to list" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getOrCreateAuthenticatedUser(req);
    if (!user) return unauthorizedJsonResponse();

    const { id } = await ctx.params;

    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get("clientId");
    if (!clientId) {
      return NextResponse.json({ error: "clientId query param is required" }, { status: 400 });
    }

    const removed = await prisma.clientListMembership.deleteMany({
      where: {
        clientId,
        listId: id,
        list: { userId: user.id },
      },
    });

    if (removed.count === 0) {
      return NextResponse.json({ error: "Membership not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/client-lists/[id]/members error", err);
    return NextResponse.json({ error: "Failed to remove client from list" }, { status: 500 });
  }
}

