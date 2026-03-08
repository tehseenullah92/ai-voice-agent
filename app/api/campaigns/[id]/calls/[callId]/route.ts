import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../../lib/prisma";
import {
  getOrCreateAuthenticatedUser,
  unauthorizedJsonResponse,
} from "../../../../../../lib/server-auth";

export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string; callId: string }> }
) {
  try {
    const user = await getOrCreateAuthenticatedUser(_req);
    if (!user) return unauthorizedJsonResponse();

    const { id: campaignId, callId } = await ctx.params;

    const campaign = await prisma.campaign.findFirst({
      where: { id: campaignId, userId: user.id },
    });
    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    const call = await prisma.call.findFirst({
      where: { id: callId, campaignId },
    });
    if (!call) {
      return NextResponse.json({ error: "Call not found" }, { status: 404 });
    }

    await prisma.call.delete({ where: { id: callId } });

    const remainingCalls = await prisma.call.count({ where: { campaignId } });
    await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        totalClients: remainingCalls,
        remaining: Math.max(0, remainingCalls - campaign.called),
      },
    });

    return NextResponse.json({ ok: true, totalClients: remainingCalls });
  } catch (err) {
    console.error("DELETE /api/campaigns/[id]/calls/[callId] error", err);
    return NextResponse.json(
      { error: "Failed to remove client from campaign" },
      { status: 500 }
    );
  }
}
