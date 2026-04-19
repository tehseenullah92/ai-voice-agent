import { NextResponse } from "next/server";

import {
  clearCampaignDialQueue,
  processDueDialsForCampaign,
  scheduleCampaignDialQueue,
  scheduleCampaignDialsLegacy,
} from "@/lib/campaign-dial-queue";
import { prisma } from "@/lib/prisma";
import {
  isTwilioOutboundReady,
  resolveOutboundFromNumber,
} from "@/lib/twilio-workspace";
import { isUpstashRedisConfigured } from "@/lib/upstash-redis";
import { requireWorkspaceContext } from "@/lib/workspace";

type Params = { params: { id: string } };

/** Large Redis enqueue runs can exceed default serverless limits. */
export const maxDuration = 300;

/**
 * Restart a campaign: reset all contacts back to "pending", then launch.
 * Existing call records are kept for history but new ones will be created.
 */
export async function POST(request: Request, { params }: Params) {
  const gate = await requireWorkspaceContext();
  if (!gate.ok) return gate.response;
  const { workspaceId } = gate.ctx;

  let body: { mode?: string } = {};
  try {
    body = (await request.json()) as { mode?: string };
  } catch {
    // empty body is fine — defaults to "all"
  }

  const mode = body.mode === "failed" ? "failed" : "all";

  const campaign = await prisma.campaign.findFirst({
    where: { id: params.id, workspaceId },
    include: { workspace: true },
  });

  if (!campaign) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { workspace } = campaign;

  if (!isTwilioOutboundReady(workspace)) {
    return NextResponse.json(
      {
        error:
          "Twilio is not configured. Connect your account in Settings first.",
      },
      { status: 400 }
    );
  }

  const fromNumber = resolveOutboundFromNumber(workspace, campaign);
  if (!fromNumber) {
    return NextResponse.json(
      {
        error:
          "No valid outbound caller ID. Choose a phone number and try again.",
      },
      { status: 400 }
    );
  }

  const contactFilter =
    mode === "failed"
      ? { campaignId: params.id, status: { in: ["failed", "no-answer"] } }
      : { campaignId: params.id, status: { not: "pending" } };

  const resetResult = await prisma.contact.updateMany({
    where: contactFilter,
    data: { status: "pending" },
  });

  await prisma.campaign.update({
    where: { id: params.id },
    data: { status: "active" },
  });

  const totalContacts = await prisma.contact.count({
    where: { campaignId: params.id, status: "pending" },
  });

  const callsPerHour = Math.max(1, campaign.callsPerHour);

  if (totalContacts === 0) {
    return NextResponse.json({
      restarted: true,
      mode,
      contactsReset: resetResult.count,
      totalContacts: 0,
      callsInitiated: 0,
      fromNumber,
    });
  }

  if (isUpstashRedisConfigured()) {
    await clearCampaignDialQueue(params.id);
    const { scheduled } = await scheduleCampaignDialQueue({
      campaignId: params.id,
      callsPerHour,
    });
    await processDueDialsForCampaign(params.id, { maxCalls: 120 });

    return NextResponse.json({
      restarted: true,
      mode,
      contactsReset: resetResult.count,
      totalContacts: scheduled,
      callsInitiated: scheduled,
      fromNumber,
      dialQueue: "upstash",
    });
  }

  const pending = await prisma.contact.findMany({
    where: { campaignId: params.id, status: "pending" },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });

  scheduleCampaignDialsLegacy({
    campaignId: params.id,
    contactIds: pending.map((c) => c.id),
    callsPerHour,
  });

  return NextResponse.json({
    restarted: true,
    mode,
    contactsReset: resetResult.count,
    totalContacts: pending.length,
    callsInitiated: pending.length,
    fromNumber,
    dialQueue: "in-process",
  });
}
