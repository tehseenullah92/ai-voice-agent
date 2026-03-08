import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import {
  getOrCreateAuthenticatedUser,
  unauthorizedJsonResponse,
} from "../../../../../lib/server-auth";

export async function POST(req: NextRequest) {
  try {
    const user = await getOrCreateAuthenticatedUser(req);
    if (!user) return unauthorizedJsonResponse();

    await prisma.phoneNumber.deleteMany({ where: { userId: user.id } });
    await prisma.twilioAccount.deleteMany({ where: { userId: user.id } });

    return NextResponse.json({ disconnected: true });
  } catch (err) {
    console.error("POST /api/settings/twilio/disconnect error", err);
    return NextResponse.json(
      { error: "Failed to disconnect Twilio account" },
      { status: 500 }
    );
  }
}
