import { NextResponse } from "next/server";

import { deductCredits } from "@/lib/billing/credits";
import { CREDIT_COSTS } from "@/lib/billing/plans";
import { maybeMarkCampaignCompleted } from "@/lib/campaign-completion";
import { prisma } from "@/lib/prisma";

function pick(
  obj: Record<string, unknown> | null | undefined,
  keys: string[]
): string | undefined {
  if (!obj) return undefined;
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === "string" && v) return v;
  }
  return undefined;
}

function asRecord(v: unknown): Record<string, unknown> | undefined {
  if (v && typeof v === "object" && !Array.isArray(v)) {
    return v as Record<string, unknown>;
  }
  return undefined;
}

export async function POST(request: Request) {
  let payload: Record<string, unknown>;
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const type = String(
    payload.type ?? payload.event_type ?? payload.event ?? ""
  ).toLowerCase();

  const data = asRecord(payload.data) ?? asRecord(payload) ?? {};

  if (type.includes("initiated") || type === "conversation_initiated") {
    const twilioSid =
      pick(data, ["twilio_call_sid", "call_sid", "twilioCallSid"]) ??
      pick(asRecord(payload), ["twilio_call_sid", "call_sid"]);

    const convId = pick(data, [
      "conversation_id",
      "conversationId",
      "elevenlabs_conversation_id",
    ]);

    if (twilioSid) {
      const call = await prisma.call.findFirst({
        where: { twilioSid },
      });
      if (call) {
        await prisma.call.update({
          where: { id: call.id },
          data: {
            status: "in_progress",
            startedAt: new Date(),
            ...(convId ? { elevenLabsConvId: convId } : {}),
          },
        });
      }
    }
  }

  if (type.includes("ended") || type === "conversation_ended") {
    const convId =
      pick(data, ["conversation_id", "conversationId"]) ??
      pick(payload, ["conversation_id", "conversationId"]);

    const twilioSidEnd =
      pick(data, ["twilio_call_sid", "call_sid", "twilioCallSid"]) ??
      pick(asRecord(payload), ["twilio_call_sid", "call_sid"]);

    const analysis = asRecord(data.analysis) ?? asRecord(payload.analysis);
    const outcome =
      (typeof analysis?.outcome === "string" ? analysis.outcome : undefined) ??
      pick(analysis ?? {}, ["outcome"]);

    const durationRaw =
      data.duration_seconds ?? data.duration ?? payload.duration_seconds;
    const duration =
      typeof durationRaw === "number"
        ? durationRaw
        : typeof durationRaw === "string"
          ? parseInt(durationRaw, 10)
          : undefined;

    const transcript = data.transcript ?? payload.transcript;

    if (!convId && !twilioSidEnd) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    const call = await prisma.call.findFirst({
      where: {
        OR: [
          ...(convId ? [{ elevenLabsConvId: convId }] : []),
          ...(twilioSidEnd ? [{ twilioSid: twilioSidEnd }] : []),
        ],
      },
      include: { contact: true },
    });

    if (call) {
      const recordingUrl =
        pick(data, ["recording_url", "recordingUrl"]) ??
        pick(asRecord(payload), ["recording_url", "recordingUrl"]);

      const summary =
        typeof analysis?.transcript_summary === "string"
          ? analysis.transcript_summary
          : undefined;

      await prisma.call.update({
        where: { id: call.id },
        data: {
          status: "completed",
          outcome: outcome ?? summary ?? null,
          duration: Number.isFinite(duration as number)
            ? (duration as number)
            : null,
          transcript:
            transcript === undefined || transcript === null
              ? undefined
              : (transcript as object),
          ...(recordingUrl ? { recordingUrl } : {}),
          ...(convId && !call.elevenLabsConvId
            ? { elevenLabsConvId: convId }
            : {}),
          endedAt: new Date(),
        },
      });

      await prisma.contact.update({
        where: { id: call.contactId },
        data: { status: "completed" },
      });

      await maybeMarkCampaignCompleted(call.campaignId);

      if (Number.isFinite(duration as number) && (duration as number) > 0) {
        const durationMinutes = Math.ceil((duration as number) / 60);
        const cost = durationMinutes * CREDIT_COSTS.callPerMinute;
        const campaign = await prisma.campaign.findUnique({
          where: { id: call.campaignId },
          select: { workspace: { select: { userId: true } } },
        });
        if (campaign?.workspace?.userId) {
          await deductCredits(
            campaign.workspace.userId,
            cost,
            "call_usage",
            call.id,
            `Call ${call.id} — ${durationMinutes} min`
          );
        }
      }
    }
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
