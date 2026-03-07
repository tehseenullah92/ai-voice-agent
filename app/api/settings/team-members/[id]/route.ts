import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import {
  getOrCreateAuthenticatedUser,
  unauthorizedJsonResponse,
} from "../../../../../lib/server-auth";

export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getOrCreateAuthenticatedUser(_req);
    if (!user) return unauthorizedJsonResponse();

    const { id } = await ctx.params;
    const deleted = await prisma.teamMember.deleteMany({
      where: { id, userId: user.id },
    });
    if (deleted.count === 0) {
      return NextResponse.json({ error: "Team member not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/settings/team-members/[id] error", err);
    return NextResponse.json({ error: "Failed to delete team member" }, { status: 500 });
  }
}

