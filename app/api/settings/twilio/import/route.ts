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

    const account = await prisma.twilioAccount.findUnique({
      where: { userId: user.id },
    });

    if (!account) {
      return NextResponse.json(
        { error: "Twilio account not connected. Connect your account first." },
        { status: 400 }
      );
    }

    const client = Twilio(account.accountSid, account.authToken);
    const incomingNumbers = await client.incomingPhoneNumbers.list();

    let imported = 0;
    for (const num of incomingNumbers) {
      const capabilities = num.capabilities
        ? JSON.stringify(num.capabilities as object)
        : null;
      await prisma.phoneNumber.upsert({
        where: {
          userId_phoneNumberSid: {
            userId: user.id,
            phoneNumberSid: num.sid,
          },
        },
        update: {
          phoneNumber: num.phoneNumber,
          friendlyName: num.friendlyName ?? null,
          capabilities,
        },
        create: {
          userId: user.id,
          twilioAccountId: account.id,
          phoneNumber: num.phoneNumber,
          phoneNumberSid: num.sid,
          friendlyName: num.friendlyName ?? null,
          label: num.friendlyName ?? null,
          capabilities,
        },
      });
      imported++;
    }

    return NextResponse.json({
      imported,
      message: `${imported} number${imported !== 1 ? "s" : ""} imported`,
    });
  } catch (err) {
    console.error("POST /api/settings/twilio/import error", err);
    return NextResponse.json(
      { error: "Failed to import phone numbers from Twilio" },
      { status: 500 }
    );
  }
}
