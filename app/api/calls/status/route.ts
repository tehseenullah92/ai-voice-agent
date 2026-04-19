import { NextResponse } from "next/server";

import { maybeMarkCampaignCompleted } from "@/lib/campaign-completion";
import { prisma } from "@/lib/prisma";

const FAILURE_STATUSES = new Set([
  "failed",
  "busy",
  "no-answer",
  "canceled",
]);

export async function POST(request: Request) {
  let callSid: string | null = null;
  let callStatus: string | null = null;

  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/x-www-form-urlencoded")) {
    const form = await request.formData();
    callSid = String(form.get("CallSid") ?? "");
    callStatus = String(form.get("CallStatus") ?? "");
  } else {
    try {
      const json = (await request.json()) as {
        CallSid?: string;
        CallStatus?: string;
      };
      callSid = json.CallSid ?? null;
      callStatus = json.CallStatus ?? null;
    } catch {
      return NextResponse.json({ ok: true });
    }
  }

  if (!callSid || !callStatus) {
    return NextResponse.json({ ok: true });
  }

  const normalized = callStatus.toLowerCase();
  if (!FAILURE_STATUSES.has(normalized)) {
    return NextResponse.json({ ok: true });
  }

  const call = await prisma.call.findFirst({
    where: { twilioSid: callSid },
    include: { contact: true },
  });

  if (!call) {
    return NextResponse.json({ ok: true });
  }

  await prisma.call.update({
    where: { id: call.id },
    data: { status: "failed" },
  });

  await prisma.contact.update({
    where: { id: call.contactId },
    data: { status: "failed" },
  });

  await maybeMarkCampaignCompleted(call.campaignId);

  return NextResponse.json({ ok: true });
}
