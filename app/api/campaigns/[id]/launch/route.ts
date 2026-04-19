import { NextResponse } from "next/server";

import { maybeMarkCampaignCompleted } from "@/lib/campaign-completion";
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

export async function POST(_request: Request, { params }: Params) {
  const gate = await requireWorkspaceContext();
  if (!gate.ok) return gate.response;
  const { userId, workspaceId } = gate.ctx;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { credits: true },
  });
  if (!user || user.credits <= 0) {
    return NextResponse.json(
      {
        error:
          "Insufficient credits. Please upgrade your plan or purchase more credits.",
      },
      { status: 402 }
    );
  }

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
          "Twilio is not configured. Add your Account SID, Auth Token, and at least one phone number in Settings.",
      },
      { status: 400 }
    );
  }

  const fromNumber = resolveOutboundFromNumber(workspace, campaign);
  if (!fromNumber) {
    return NextResponse.json(
      {
        error:
          "No valid outbound caller ID. Choose a phone number in Phone numbers or in the campaign, then try again.",
      },
      { status: 400 }
    );
  }

  await prisma.campaign.update({
    where: { id: params.id },
    data: { status: "active" },
  });

  const totalContacts = await prisma.contact.count({
    where: { campaignId: params.id, status: "pending" },
  });

  if (totalContacts === 0) {
    await maybeMarkCampaignCompleted(params.id);
    return NextResponse.json({
      launched: true,
      totalContacts: 0,
      callsInitiated: 0,
      fromNumber,
    });
  }

  const callsPerHour = Math.max(1, campaign.callsPerHour);

  if (isUpstashRedisConfigured()) {
    await clearCampaignDialQueue(params.id);
    const { scheduled } = await scheduleCampaignDialQueue({
      campaignId: params.id,
      callsPerHour,
    });
    await processDueDialsForCampaign(params.id, { maxCalls: 120 });

    return NextResponse.json({
      launched: true,
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
    launched: true,
    totalContacts,
    callsInitiated: totalContacts,
    fromNumber,
    dialQueue: "in-process",
  });
}
