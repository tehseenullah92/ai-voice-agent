import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import { syncElevenLabsAgent } from "@/lib/elevenlabs";
import { prisma } from "@/lib/prisma";
import { assertFromNumberAllowed } from "@/lib/twilio-workspace";
import { requireWorkspaceContext } from "@/lib/workspace";

export async function GET() {
  const gate = await requireWorkspaceContext();
  if (!gate.ok) return gate.response;
  const { workspaceId } = gate.ctx;

  const campaigns = await prisma.campaign.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { calls: true, contacts: true } },
    },
  });
  return NextResponse.json(campaigns);
}

type ContactInput = { phone: string; data?: Record<string, unknown> | null };

export async function POST(request: Request) {
  const gate = await requireWorkspaceContext();
  if (!gate.ok) return gate.response;
  const { workspaceId } = gate.ctx;

  let body: {
    name: string;
    type: string;
    description?: string | null;
    status?: string;
    agentName?: string | null;
    agentVoice?: string | null;
    openingLine?: string | null;
    instructions?: string | null;
    maxDuration?: number;
    startAt?: string | null;
    callHoursFrom?: string | null;
    callHoursTo?: string | null;
    timezone?: string | null;
    callsPerHour?: number;
    stopWhenAllReached?: boolean;
    /** E.164; omit or null to use workspace default */
    fromPhoneNumber?: string | null;
    contacts: ContactInput[];
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.name || !body.type) {
    return NextResponse.json(
      { error: "name and type are required" },
      { status: 400 }
    );
  }

  const contacts = Array.isArray(body.contacts) ? body.contacts : [];

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
  });
  if (!workspace) {
    return NextResponse.json({ error: "Workspace not found" }, { status: 500 });
  }

  const fromOverride =
    body.fromPhoneNumber === undefined || body.fromPhoneNumber === null
      ? null
      : String(body.fromPhoneNumber).trim() || null;

  if (
    fromOverride &&
    !assertFromNumberAllowed(workspace, fromOverride)
  ) {
    return NextResponse.json(
      {
        error:
          "Invalid caller ID: pick a number from your Twilio account or leave it unset to use the workspace default.",
      },
      { status: 400 }
    );
  }

  const campaign = await prisma.campaign.create({
    data: {
      workspaceId,
      name: body.name,
      type: body.type,
      description: body.description ?? null,
      status: body.status ?? "draft",
      agentName: body.agentName ?? null,
      agentVoice: body.agentVoice ?? null,
      openingLine: body.openingLine ?? null,
      instructions: body.instructions ?? null,
      maxDuration: body.maxDuration ?? 5,
      startAt: body.startAt ? new Date(body.startAt) : null,
      callHoursFrom: body.callHoursFrom ?? null,
      callHoursTo: body.callHoursTo ?? null,
      timezone: body.timezone ?? null,
      callsPerHour: body.callsPerHour ?? 60,
      stopWhenAllReached: body.stopWhenAllReached ?? true,
      fromPhoneNumber: fromOverride,
    },
  });

  if (contacts.length > 0) {
    await prisma.contact.createMany({
      data: contacts.map((c) => ({
        campaignId: campaign.id,
        phone: c.phone,
        data:
          c.data === undefined || c.data === null
            ? undefined
            : (c.data as Prisma.InputJsonValue),
      })),
    });
  }

  const full = await prisma.campaign.findUniqueOrThrow({
    where: { id: campaign.id },
  });

  let agentId: string;
  try {
    agentId = await syncElevenLabsAgent(full);
  } catch (e) {
    await prisma.contact.deleteMany({ where: { campaignId: campaign.id } });
    await prisma.campaign.delete({ where: { id: campaign.id } });
    const message = e instanceof Error ? e.message : "ElevenLabs sync failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  const updated = await prisma.campaign.update({
    where: { id: campaign.id },
    data: { elevenLabsAgentId: agentId },
    include: {
      _count: { select: { calls: true, contacts: true } },
    },
  });

  return NextResponse.json(updated);
}
