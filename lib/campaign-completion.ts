import { prisma } from "@/lib/prisma";

/**
 * When every contact is in a terminal state and the campaign is still active,
 * set campaign status to `completed`.
 */
export async function maybeMarkCampaignCompleted(campaignId: string) {
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    select: { status: true },
  });

  if (!campaign || campaign.status !== "active") return;

  const pending = await prisma.contact.count({
    where: { campaignId, status: "pending" },
  });
  if (pending > 0) return;

  await prisma.campaign.update({
    where: { id: campaignId },
    data: { status: "completed" },
  });
}
