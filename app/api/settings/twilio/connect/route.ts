import { NextRequest, NextResponse } from "next/server";
import Twilio from "twilio";
import { prisma } from "../../../../../lib/prisma";
import {
  getOrCreateAuthenticatedUser,
  unauthorizedJsonResponse,
} from "../../../../../lib/server-auth";

export async function POST(req: NextRequest) {
  try {
    const user = await getOrCreateAuthenticatedUser(req);
    if (!user) return unauthorizedJsonResponse();

    const body = await req.json();
    const { accountSid, authToken } = body as {
      accountSid?: string;
      authToken?: string;
    };

    if (!accountSid?.trim() || !authToken?.trim()) {
      return NextResponse.json(
        { error: "Account SID and Auth Token are required" },
        { status: 400 }
      );
    }

    // Validate credentials by calling Twilio API
    const client = Twilio(accountSid.trim(), authToken.trim());
    let accountName: string | undefined;
    try {
      const account = await client.api.accounts(accountSid.trim()).fetch();
      accountName = account.friendlyName ?? undefined;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Invalid Twilio credentials";
      return NextResponse.json(
        { error: msg.includes("20003") ? "Invalid Account SID or Auth Token" : msg },
        { status: 400 }
      );
    }

    await prisma.twilioAccount.upsert({
      where: { userId: user.id },
      update: {
        accountSid: accountSid.trim(),
        authToken: authToken.trim(),
        accountName: accountName ?? null,
      },
      create: {
        userId: user.id,
        accountSid: accountSid.trim(),
        authToken: authToken.trim(),
        accountName: accountName ?? null,
      },
    });

    return NextResponse.json({
      connected: true,
      accountSidMasked: `${accountSid.slice(0, 6)}****${accountSid.slice(-4)}`,
    });
  } catch (err) {
    console.error("POST /api/settings/twilio/connect error", err);
    return NextResponse.json(
      { error: "Failed to connect Twilio account" },
      { status: 500 }
    );
  }
}
