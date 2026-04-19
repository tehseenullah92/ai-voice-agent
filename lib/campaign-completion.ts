import { prisma } from "@/lib/prisma";
import { sendCampaignCompletedEmail } from "@/lib/campaign-completion-email";

/**
 * When every contact is in a terminal state and the campaign is still active,
 * set campaign status to `completed` (atomically) and notify the workspace
 * owner by email.
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

  // Atomic active -> completed transition. With concurrent webhooks racing on
  // the same final call, only one caller sees count === 1 and dispatches the
  // notification email.
  const updated = await prisma.campaign.updateMany({
    where: { id: campaignId, status: "active" },
    data: { status: "completed" },
  });
  if (updated.count === 0) return;

  // Don't block the caller (a webhook handler) on SMTP delivery, but still log
  // failures. We deliberately swallow errors so a misconfigured SMTP server
  // can't make Twilio / ElevenLabs retry every webhook forever.
  try {
    await sendCampaignCompletedEmail(campaignId);
  } catch (err) {
    console.error(
      "[campaign-completion] failed to send completion email",
      err
    );
  }
}
