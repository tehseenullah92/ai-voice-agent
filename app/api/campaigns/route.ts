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

    const campaigns = await prisma.campaign.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ campaigns });
  } catch (err) {
    console.error("GET /api/campaigns error", err);
    return NextResponse.json({ error: "Failed to load campaigns" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getOrCreateAuthenticatedUser(req);
    if (!user) return unauthorizedJsonResponse();
    const body = await req.json();

    const {
      name,
      project,
      language,
      concurrency,
      clientList,
      voiceId,
      greeting,
      prompt,
      maxRetries,
      callHoursStart,
      callHoursEnd,
    } = body;

    if (!name || !project) {
      return NextResponse.json(
        { error: "Campaign name and project are required" },
        { status: 400 }
      );
    }

    const created = await prisma.campaign.create({
      data: {
        userId: user.id,
        name,
        project,
        language: language || "Urdu",
        concurrency: concurrency ? Number(concurrency) : 5,
        clientListKey: clientList,
        voiceId,
        greeting,
        prompt,
        maxRetries: maxRetries ? Number(maxRetries) : 0,
        callStart: callHoursStart,
        callEnd: callHoursEnd,
      },
    });

    return NextResponse.json({ campaign: created }, { status: 201 });
  } catch (err) {
    console.error("POST /api/campaigns error", err);
    return NextResponse.json({ error: "Failed to create campaign" }, { status: 500 });
  }
}

