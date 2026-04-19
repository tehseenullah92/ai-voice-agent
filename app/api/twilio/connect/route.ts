import axios from "axios";
import { NextResponse } from "next/server";

import { encryptSecret } from "@/lib/field-crypto";
import {
  fetchAllIncomingPhoneNumbers,
  mapIncomingToEntries,
} from "@/lib/twilio-incoming";
import { prisma } from "@/lib/prisma";
import { requireWorkspaceContext } from "@/lib/workspace";

export async function POST(request: Request) {
  const gate = await requireWorkspaceContext();
  if (!gate.ok) return gate.response;
  const { workspaceId } = gate.ctx;

  let body: { accountSid?: string; authToken?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { accountSid, authToken } = body;
  if (!accountSid || !authToken) {
    return NextResponse.json(
      { error: "accountSid and authToken are required" },
      { status: 400 }
    );
  }

  try {
    await axios.get(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}.json`,
      {
        auth: { username: accountSid, password: authToken },
      }
    );
  } catch {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });
  }

  try {
    const rows = await fetchAllIncomingPhoneNumbers(accountSid, authToken);
    const entries = mapIncomingToEntries(rows);

    if (entries.length === 0) {
      return NextResponse.json(
        { error: "No incoming phone numbers found on this account" },
        { status: 400 }
      );
    }

    const defaultFrom = entries[0].phoneNumber;

    await prisma.workspace.update({
      where: { id: workspaceId },
      data: {
        twilioSid: accountSid,
        twilioToken: encryptSecret(authToken),
        twilioNumber: defaultFrom,
        twilioIncomingNumbers: entries as unknown as object[],
      },
    });

    return NextResponse.json({
      success: true,
      phoneNumber: defaultFrom,
      phoneNumbers: entries,
      count: entries.length,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Could not load phone numbers from Twilio" },
      { status: 400 }
    );
  }
}
