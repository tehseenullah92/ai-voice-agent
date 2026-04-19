import twilio from "twilio";

import { decryptSecret } from "@/lib/field-crypto";
import { publicAbsoluteUrl } from "@/lib/public-app-url";
import { prisma } from "@/lib/prisma";
import {
  isTwilioOutboundReady,
  resolveOutboundFromNumber,
} from "@/lib/twilio-workspace";

export async function initiateCall(campaignId: string, contactId: string) {
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: { workspace: true },
  });
  const contact = await prisma.contact.findUnique({ where: { id: contactId } });

  if (!campaign || !contact) throw new Error("Campaign or contact not found");

  const { workspace } = campaign;

  if (!isTwilioOutboundReady(workspace)) {
    throw new Error("Twilio is not configured for this workspace");
  }

  const fromNumber = resolveOutboundFromNumber(workspace, campaign);
  if (!fromNumber) {
    throw new Error(
      "No valid outbound caller ID — configure Twilio and pick a number"
    );
  }

  const twilioToken = decryptSecret(workspace.twilioToken!);

  const call = await prisma.call.create({
    data: { campaignId, contactId, status: "queued" },
  });

  const client = twilio(workspace.twilioSid!, twilioToken);

  const twimlUrl = publicAbsoluteUrl("/api/calls/twiml", { callId: call.id });
  const statusUrl = publicAbsoluteUrl("/api/calls/status");

  const twilioCall = await client.calls.create({
    from: fromNumber,
    to: contact.phone,
    url: twimlUrl,
    method: "POST",
    statusCallback: statusUrl,
    statusCallbackMethod: "POST",
  });

  const updated = await prisma.call.update({
    where: { id: call.id },
    data: { twilioSid: twilioCall.sid, status: "initiated" },
  });

  return updated;
}
