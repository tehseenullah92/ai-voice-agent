import { NextResponse } from "next/server";

import { COMMON_TIMEZONES } from "@/lib/campaign-wizard-types";
import { prisma } from "@/lib/prisma";
import {
  isTwilioOutboundReady,
  parseIncomingNumbers,
} from "@/lib/twilio-workspace";
import { requireWorkspaceContext } from "@/lib/workspace";

const ALLOWED_TIMEZONES = new Set(
  COMMON_TIMEZONES.map((z) => z.value as string)
);

export async function GET() {
  const gate = await requireWorkspaceContext();
  if (!gate.ok) return gate.response;
  const { workspaceId } = gate.ctx;

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: {
      twilioSid: true,
      twilioToken: true,
      twilioNumber: true,
      twilioIncomingNumbers: true,
      name: true,
      defaultTimezone: true,
    },
  });

  if (!workspace) {
    return NextResponse.json({ error: "Workspace not found" }, { status: 500 });
  }

  const incoming = parseIncomingNumbers(workspace);
  const twilioConfigured = isTwilioOutboundReady(workspace);

  return NextResponse.json({
    twilioConfigured,
    /** Public Account SID (safe to display); only set when connected */
    accountSid: workspace.twilioSid?.trim() || null,
    incomingPhoneNumbers: incoming,
    defaultFromNumber: workspace.twilioNumber,
    workspaceName: workspace.name?.trim() || null,
    defaultTimezone: workspace.defaultTimezone?.trim() || null,
  });
}

type PatchBody = {
  defaultFromNumber?: string;
  name?: string | null;
  defaultTimezone?: string | null;
};

export async function PATCH(request: Request) {
  const gate = await requireWorkspaceContext();
  if (!gate.ok) return gate.response;
  const { workspaceId } = gate.ctx;

  let body: PatchBody;
  try {
    body = (await request.json()) as PatchBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const hasPhone =
    body.defaultFromNumber !== undefined && body.defaultFromNumber !== "";
  const hasName = body.name !== undefined;
  const hasTz = body.defaultTimezone !== undefined;

  if (!hasPhone && !hasName && !hasTz) {
    return NextResponse.json(
      { error: "No updates provided" },
      { status: 400 }
    );
  }

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
  });

  if (!workspace) {
    return NextResponse.json({ error: "Workspace not found" }, { status: 500 });
  }

  if (hasPhone) {
    const next = String(body.defaultFromNumber ?? "").trim();
    if (!next) {
      return NextResponse.json(
        { error: "defaultFromNumber is required when updating caller ID" },
        { status: 400 }
      );
    }

    const allowed = new Set(
      parseIncomingNumbers(workspace).map((n) => n.phoneNumber)
    );
    if (!allowed.has(next)) {
      return NextResponse.json(
        { error: "That number is not on your Twilio account" },
        { status: 400 }
      );
    }

    await prisma.workspace.update({
      where: { id: workspaceId },
      data: { twilioNumber: next },
    });

    return NextResponse.json({ success: true, defaultFromNumber: next });
  }

  const data: { name?: string | null; defaultTimezone?: string | null } = {};

  if (hasName) {
    const raw = body.name;
    const trimmed =
      raw === null || raw === undefined ? "" : String(raw).trim();
    data.name = trimmed === "" ? null : trimmed.slice(0, 191);
  }

  if (hasTz) {
    const tz = String(body.defaultTimezone ?? "").trim();
    if (tz === "") {
      data.defaultTimezone = null;
    } else if (!ALLOWED_TIMEZONES.has(tz)) {
      return NextResponse.json(
        { error: "Unsupported timezone" },
        { status: 400 }
      );
    } else {
      data.defaultTimezone = tz;
    }
  }

  await prisma.workspace.update({
    where: { id: workspaceId },
    data,
  });

  return NextResponse.json({
    success: true,
    workspaceName: data.name ?? undefined,
    defaultTimezone: data.defaultTimezone ?? undefined,
  });
}
