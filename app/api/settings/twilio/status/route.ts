import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import {
  getOrCreateAuthenticatedUser,
  unauthorizedJsonResponse,
} from "../../../../../lib/server-auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getOrCreateAuthenticatedUser(req);
    if (!user) return unauthorizedJsonResponse();

    const account = await prisma.twilioAccount.findUnique({
      where: { userId: user.id },
    });

    if (!account) {
      return NextResponse.json({ connected: false });
    }

    const accountSidMasked = `${account.accountSid.slice(0, 6)}****${account.accountSid.slice(-4)}`;

    return NextResponse.json({
      connected: true,
      accountSidMasked,
      accountName: account.accountName ?? null,
    });
  } catch (err) {
    console.error("GET /api/settings/twilio/status error", err);
    return NextResponse.json(
      { error: "Failed to get Twilio status" },
      { status: 500 }
    );
  }
}
