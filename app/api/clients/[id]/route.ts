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
    const { name, phone, location, tags, status, source } = body;

    if (!name || !phone) {
      return NextResponse.json({ error: "Name and phone are required" }, { status: 400 });
    }

    const updateResult = await prisma.client.updateMany({
      where: { id, userId: user.id },
      data: {
        name,
        phone,
        location,
        tags,
        status,
        source,
      },
    });

    if (updateResult.count === 0) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const updated = await prisma.client.findFirst({
      where: { id, userId: user.id },
    });
    if (!updated) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    return NextResponse.json({ client: updated });
  } catch (err) {
    console.error("PUT /api/clients/[id] error", err);
    return NextResponse.json({ error: "Failed to update client" }, { status: 500 });
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
    const updateResult = await prisma.client.updateMany({
      where: { id, userId: user.id },
      data: body,
    });

    if (updateResult.count === 0) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const updated = await prisma.client.findFirst({
      where: { id, userId: user.id },
    });
    if (!updated) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }
    return NextResponse.json({ client: updated });
  } catch (err) {
    console.error("PATCH /api/clients/[id] error", err);
    return NextResponse.json({ error: "Failed to update client" }, { status: 500 });
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

    const deleted = await prisma.client.deleteMany({
      where: { id, userId: user.id },
    });
    if (deleted.count === 0) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/clients/[id] error", err);
    return NextResponse.json({ error: "Failed to delete client" }, { status: 500 });
  }
}

