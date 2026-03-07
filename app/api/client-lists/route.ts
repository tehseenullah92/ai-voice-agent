import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import {
  getOrCreateAuthenticatedUser,
  unauthorizedJsonResponse,
} from "../../../lib/server-auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getOrCreateAuthenticatedUser(req);
    if (!user) return unauthorizedJsonResponse();

    const lists = await prisma.clientList.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        memberships: {
          select: { clientId: true },
        },
      },
    });

    const shaped = lists.map((l) => ({
      id: l.id,
      name: l.name,
      description: l.description,
      campaigns: l.campaigns,
      createdAt: l.createdAt,
      memberIds: l.memberships.map((m) => m.clientId),
    }));

    return NextResponse.json({ lists: shaped });
  } catch (err) {
    console.error("GET /api/client-lists error", err);
    return NextResponse.json({ error: "Failed to load client lists" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getOrCreateAuthenticatedUser(req);
    if (!user) return unauthorizedJsonResponse();
    const body = await req.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const created = await prisma.clientList.create({
      data: {
        userId: user.id,
        name,
        description,
      },
    });

    return NextResponse.json({ list: created }, { status: 201 });
  } catch (err) {
    console.error("POST /api/client-lists error", err);
    return NextResponse.json({ error: "Failed to create client list" }, { status: 500 });
  }
}

