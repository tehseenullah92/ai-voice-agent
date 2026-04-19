import { NextResponse } from "next/server";

import { clearCampaignDialQueue } from "@/lib/campaign-dial-queue";
import { deleteElevenLabsAgent, syncElevenLabsAgent } from "@/lib/elevenlabs";
import { prisma } from "@/lib/prisma";
import { isUpstashRedisConfigured } from "@/lib/upstash-redis";
import { assertFromNumberAllowed } from "@/lib/twilio-workspace";
import { requireWorkspaceContext } from "@/lib/workspace";

type Params = { params: { id: string } };

export async function GET(_request: Request, { params }: Params) {
  const gate = await requireWorkspaceContext();
  if (!gate.ok) return gate.response;
  const { workspaceId } = gate.ctx;

  const campaign = await prisma.campaign.findFirst({
    where: { id: params.id, workspaceId },
    include: {
      _count: { select: { contacts: true, calls: true } },
    },
  });

  if (!campaign) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const grouped = await prisma.call.groupBy({
    by: ["status"],
    where: { campaignId: params.id },
    _count: { _all: true },
  });

  const callStats = Object.fromEntries(
    grouped.map((g) => [g.status, g._count._all])
  ) as Record<string, number>;

  return NextResponse.json({ campaign, callStats });
}

export async function DELETE(_request: Request, { params }: Params) {
  const gate = await requireWorkspaceContext();
  if (!gate.ok) return gate.response;
  const { workspaceId } = gate.ctx;

  const campaign = await prisma.campaign.findFirst({
    where: { id: params.id, workspaceId },
  });

  if (!campaign) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await deleteElevenLabsAgent(campaign.elevenLabsAgentId);

  if (isUpstashRedisConfigured()) {
    try {
      await clearCampaignDialQueue(params.id);
    } catch {
      // best-effort — campaign row is still removed below
    }
  }

  await prisma.$transaction([
    prisma.call.deleteMany({ where: { campaignId: params.id } }),
    prisma.contact.deleteMany({ where: { campaignId: params.id } }),
    prisma.campaign.delete({ where: { id: params.id } }),
  ]);

  return NextResponse.json({ ok: true });
}

export async function PATCH(request: Request, { params }: Params) {
  const gate = await requireWorkspaceContext();
  if (!gate.ok) return gate.response;
  const { workspaceId } = gate.ctx;

  const existing = await prisma.campaign.findFirst({
    where: { id: params.id, workspaceId },
  });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
  });
  if (!workspace) {
    return NextResponse.json({ error: "Workspace not found" }, { status: 500 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const {
    name,
    type,
    description,
    status,
    agentName,
    agentVoice,
    openingLine,
    instructions,
    maxDuration,
    startAt,
    callHoursFrom,
    callHoursTo,
    timezone,
    callsPerHour,
    stopWhenAllReached,
    fromPhoneNumber,
  } = body;

  if (fromPhoneNumber !== undefined) {
    const next =
      fromPhoneNumber === null || fromPhoneNumber === ""
        ? null
        : String(fromPhoneNumber).trim() || null;
    if (next && !assertFromNumberAllowed(workspace, next)) {
      return NextResponse.json(
        {
          error:
            "Invalid caller ID: pick a number from your Twilio account or clear the override.",
        },
        { status: 400 }
      );
    }
  }

  const updated = await prisma.campaign.update({
    where: { id: params.id },
    data: {
      ...(name !== undefined && typeof name === "string" ? { name } : {}),
      ...(type !== undefined && typeof type === "string" ? { type } : {}),
      ...(description !== undefined
        ? { description: description as string | null }
        : {}),
      ...(status !== undefined && typeof status === "string" ? { status } : {}),
      ...(agentName !== undefined
        ? { agentName: agentName as string | null }
        : {}),
      ...(agentVoice !== undefined
        ? { agentVoice: agentVoice as string | null }
        : {}),
      ...(openingLine !== undefined
        ? { openingLine: openingLine as string | null }
        : {}),
      ...(instructions !== undefined
        ? { instructions: instructions as string | null }
        : {}),
      ...(maxDuration !== undefined && typeof maxDuration === "number"
        ? { maxDuration }
        : {}),
      ...(startAt !== undefined
        ? {
            startAt:
              startAt === null || startAt === ""
                ? null
                : new Date(String(startAt)),
          }
        : {}),
      ...(callHoursFrom !== undefined
        ? { callHoursFrom: callHoursFrom as string | null }
        : {}),
      ...(callHoursTo !== undefined
        ? { callHoursTo: callHoursTo as string | null }
        : {}),
      ...(timezone !== undefined
        ? { timezone: timezone as string | null }
        : {}),
      ...(callsPerHour !== undefined && typeof callsPerHour === "number"
        ? { callsPerHour }
        : {}),
      ...(stopWhenAllReached !== undefined && typeof stopWhenAllReached === "boolean"
        ? { stopWhenAllReached }
        : {}),
      ...(fromPhoneNumber !== undefined
        ? {
            fromPhoneNumber:
              fromPhoneNumber === null || fromPhoneNumber === ""
                ? null
                : String(fromPhoneNumber).trim() || null,
          }
        : {}),
    },
  });

  let agentId: string;
  try {
    agentId = await syncElevenLabsAgent(updated);
  } catch (e) {
    const message = e instanceof Error ? e.message : "ElevenLabs sync failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  const result = await prisma.campaign.update({
    where: { id: params.id },
    data: { elevenLabsAgentId: agentId },
    include: {
      _count: { select: { calls: true, contacts: true } },
    },
  });

  return NextResponse.json(result);
}
