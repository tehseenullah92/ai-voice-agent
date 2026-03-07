import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import {
  getOrCreateAuthenticatedUser,
  unauthorizedJsonResponse,
} from "../../../../lib/server-auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getOrCreateAuthenticatedUser(req);
    if (!user) return unauthorizedJsonResponse();

    const members = await prisma.teamMember.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ members });
  } catch (err) {
    console.error("GET /api/settings/team-members error", err);
    return NextResponse.json({ error: "Failed to load team members" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getOrCreateAuthenticatedUser(req);
    if (!user) return unauthorizedJsonResponse();
    const body = await req.json();
    const { name, inviteEmail, role } = body as {
      name?: string;
      inviteEmail?: string;
      role?: string;
    };

    if (!name || !inviteEmail) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    const created = await prisma.teamMember.create({
      data: {
        userId: user.id,
        name,
        email: inviteEmail,
        role: role || "Agent",
      },
    });

    return NextResponse.json({ member: created }, { status: 201 });
  } catch (err) {
    console.error("POST /api/settings/team-members error", err);
    return NextResponse.json({ error: "Failed to invite member" }, { status: 500 });
  }
}

