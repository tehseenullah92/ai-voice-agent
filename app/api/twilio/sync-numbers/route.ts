import axios from "axios";
import { NextResponse } from "next/server";

import { decryptSecret } from "@/lib/field-crypto";
import {
  fetchAllIncomingPhoneNumbers,
  mapIncomingToEntries,
} from "@/lib/twilio-incoming";
import { prisma } from "@/lib/prisma";
import { requireWorkspaceContext } from "@/lib/workspace";

export async function POST() {
  const gate = await requireWorkspaceContext();
  if (!gate.ok) return gate.response;
  const { workspaceId } = gate.ctx;

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
  });

  if (!workspace?.twilioSid?.trim() || !workspace.twilioToken?.trim()) {
    return NextResponse.json(
      { error: "Connect Twilio in settings first" },
      { status: 400 }
    );
  }

  const token = decryptSecret(workspace.twilioToken);
  const accountSid = workspace.twilioSid.trim();

  try {
    await axios.get(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}.json`,
      {
        auth: { username: accountSid, password: token },
      }
    );
  } catch {
    return NextResponse.json(
      { error: "Stored Twilio credentials are no longer valid" },
      { status: 400 }
    );
  }

  try {
    const rows = await fetchAllIncomingPhoneNumbers(accountSid, token);
    const entries = mapIncomingToEntries(rows);

    if (entries.length === 0) {
      return NextResponse.json(
        { error: "No incoming phone numbers found on this Twilio account" },
        { status: 400 }
      );
    }

    const previousDefault = workspace.twilioNumber?.trim();
    let nextDefault = previousDefault;

    if (!nextDefault || !entries.some((e) => e.phoneNumber === nextDefault)) {
      nextDefault = entries[0].phoneNumber;
    }

    await prisma.workspace.update({
      where: { id: workspaceId },
      data: {
        twilioIncomingNumbers: entries as unknown as object[],
        twilioNumber: nextDefault,
      },
    });

    return NextResponse.json({
      success: true,
      count: entries.length,
      defaultFromNumber: nextDefault,
      incomingPhoneNumbers: entries,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Could not sync numbers from Twilio" },
      { status: 400 }
    );
  }
}
