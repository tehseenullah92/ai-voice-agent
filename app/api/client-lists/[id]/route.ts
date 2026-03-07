import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import {
  getOrCreateAuthenticatedUser,
  unauthorizedJsonResponse,
} from "../../../../lib/server-auth";

export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getOrCreateAuthenticatedUser(req);
    if (!user) return unauthorizedJsonResponse();

    const { id } = await ctx.params;

    const body = await req.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const updateResult = await prisma.clientList.updateMany({
      where: { id, userId: user.id },
      data: { name, description },
    });

    if (updateResult.count === 0) {
      return NextResponse.json({ error: "Client list not found" }, { status: 404 });
    }

    const updated = await prisma.clientList.findFirst({ where: { id, userId: user.id } });
    if (!updated) {
      return NextResponse.json({ error: "Client list not found" }, { status: 404 });
    }

    return NextResponse.json({ list: updated });
  } catch (err) {
    console.error("PUT /api/client-lists/[id] error", err);
    return NextResponse.json({ error: "Failed to update client list" }, { status: 500 });
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
    const deleted = await prisma.clientList.deleteMany({ where: { id, userId: user.id } });
    if (deleted.count === 0) {
      return NextResponse.json({ error: "Client list not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/client-lists/[id] error", err);
    return NextResponse.json({ error: "Failed to delete client list" }, { status: 500 });
  }
}

