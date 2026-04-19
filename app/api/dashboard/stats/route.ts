import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import {
  isTwilioOutboundReady,
  parseIncomingNumbers,
} from "@/lib/twilio-workspace";
import { requireWorkspaceContext } from "@/lib/workspace";

export async function GET() {
  const gate = await requireWorkspaceContext();
  if (!gate.ok) return gate.response;
  const { workspaceId, userId } = gate.ctx;

  const [workspace, user] = await Promise.all([
    prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: {
        twilioSid: true,
        twilioToken: true,
        twilioNumber: true,
        twilioIncomingNumbers: true,
      },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    }),
  ]);

  if (!workspace) {
    return NextResponse.json({ error: "Workspace not found" }, { status: 500 });
  }

  const twilioConnected = isTwilioOutboundReady(workspace);
  const phoneNumbers = parseIncomingNumbers(workspace);
  const hasNumbers = phoneNumbers.length > 0;

  const campaigns = await prisma.campaign.findMany({
    where: { workspaceId },
    select: { id: true, status: true },
  });

  const hasCampaigns = campaigns.length > 0;
  const activeCampaigns = campaigns.filter(
    (c) => c.status.toLowerCase() === "active"
  ).length;
  const totalCampaigns = campaigns.length;

  const campaignIds = campaigns.map((c) => c.id);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const hasAnyCampaign = campaignIds.length > 0;

  const [totalCalls, callsToday, completedCalls] = hasAnyCampaign
    ? await Promise.all([
        prisma.call.count({
          where: { campaignId: { in: campaignIds } },
        }),
        prisma.call.count({
          where: {
            campaignId: { in: campaignIds },
            createdAt: { gte: todayStart },
          },
        }),
        prisma.call.count({
          where: {
            campaignId: { in: campaignIds },
            status: "completed",
          },
        }),
      ])
    : [0, 0, 0];

  const answerRate =
    totalCalls > 0 ? Math.round((completedCalls / totalCalls) * 100) : 0;

  return NextResponse.json({
    userEmail: user?.email ?? "",
    setup: {
      twilioConnected,
      hasNumbers,
      hasCampaigns,
      isComplete: twilioConnected && hasNumbers && hasCampaigns,
    },
    stats: {
      activeCampaigns,
      totalCampaigns,
      totalCalls,
      callsToday,
      answerRate,
    },
  });
}
