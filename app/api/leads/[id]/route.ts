import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import {
  getOrCreateAuthenticatedUser,
  unauthorizedJsonResponse,
} from "../../../../lib/server-auth";

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getOrCreateAuthenticatedUser(req);
    if (!user) return unauthorizedJsonResponse();

    const { id } = await ctx.params;
    const body = await req.json();

    const updateResult = await prisma.lead.updateMany({
      where: { id, userId: user.id },
      data: body,
    });

    if (updateResult.count === 0) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const updated = await prisma.lead.findFirst({ where: { id, userId: user.id } });
    if (!updated) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const shaped = {
      id: updated.id,
      name: updated.name,
      phone: updated.phone,
      campaign: updated.campaign ?? "",
      project: updated.project ?? "",
      interest: updated.interest,
      status: updated.status,
      assignedTo: updated.assignedTo ?? "Unassigned",
      date: updated.date.toISOString().split("T")[0],
      notes: updated.notes ?? "",
    };

    return NextResponse.json({ lead: shaped });
  } catch (err) {
    console.error("PATCH /api/leads/[id] error", err);
    return NextResponse.json({ error: "Failed to update lead" }, { status: 500 });
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
    const deleted = await prisma.lead.deleteMany({ where: { id, userId: user.id } });
    if (deleted.count === 0) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/leads/[id] error", err);
    return NextResponse.json({ error: "Failed to delete lead" }, { status: 500 });
  }
}

