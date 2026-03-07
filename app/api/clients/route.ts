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

    const clients = await prisma.client.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ clients });
  } catch (err) {
    console.error("GET /api/clients error", err);
    return NextResponse.json({ error: "Failed to load clients" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getOrCreateAuthenticatedUser(req);
    if (!user) return unauthorizedJsonResponse();
    const body = await req.json();

    const {
      name,
      phone,
      location,
      tags, // comma-separated string
      status,
      source,
      notes,
    } = body;

    if (!name || !phone) {
      return NextResponse.json({ error: "Name and phone are required" }, { status: 400 });
    }

    const created = await prisma.client.create({
      data: {
        userId: user.id,
        name,
        phone,
        location,
        tags,
        status,
        source,
        notes,
      },
    });

    return NextResponse.json({ client: created }, { status: 201 });
  } catch (err) {
    console.error("POST /api/clients error", err);
    return NextResponse.json({ error: "Failed to create client" }, { status: 500 });
  }
}

