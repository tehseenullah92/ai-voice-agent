import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { resolveOutboundFromNumber } from "@/lib/twilio-workspace";

const ELEVEN_REGISTER =
  "https://api.elevenlabs.io/v1/convai/twilio/register-call";

function twimlResponse(xml: string) {
  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}

function errorSay(message: string) {
  const safe = message.replace(/[^a-zA-Z0-9 .,!?'\-]/g, "");
  return twimlResponse(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna">${safe}</Say>
</Response>`);
}

/**
 * Twilio requests this URL when the callee answers (usually HTTP POST with From, To, CallSid).
 * We proxy to ElevenLabs register-call to get the correct TwiML for the media stream.
 */
async function handleTwiml(request: Request) {
  const url = new URL(request.url);
  const callId = url.searchParams.get("callId");

  let fromTwilio: string | null = null;
  let toTwilio: string | null = null;

  if (request.method === "POST") {
    try {
      const fd = await request.formData();
      fromTwilio =
        String(fd.get("From") ?? fd.get("from") ?? "").trim() || null;
      toTwilio = String(fd.get("To") ?? fd.get("to") ?? "").trim() || null;
    } catch (e) {
      console.error("twiml: failed to parse Twilio body", e);
    }
  }

  if (!callId) {
    return errorSay("Missing call identifier.");
  }

  const call = await prisma.call.findUnique({
    where: { id: callId },
    include: {
      contact: true,
      campaign: { include: { workspace: true } },
    },
  });

  const agentId = call?.campaign.elevenLabsAgentId;
  if (!call || !agentId) {
    return errorSay("Call configuration is incomplete.");
  }

  const { contact, campaign } = call;
  const { workspace } = campaign;
  const fromResolved =
    fromTwilio ?? resolveOutboundFromNumber(workspace, campaign);
  const toResolved = toTwilio ?? contact.phone;

  if (!fromResolved?.trim() || !toResolved?.trim()) {
    return errorSay("Could not resolve phone numbers for this call.");
  }

  const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
  if (!apiKey) {
    console.error("twiml: ELEVENLABS_API_KEY is not set");
    return errorSay("Server configuration error.");
  }

  const elevenRes = await fetch(ELEVEN_REGISTER, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      agent_id: agentId,
      from_number: fromResolved.trim(),
      to_number: toResolved.trim(),
      direction: "outbound",
      conversation_initiation_client_data: {
        source_info: {
          source: "twilio",
        },
      },
    }),
  });

  const raw = await elevenRes.text();
  if (!elevenRes.ok) {
    console.error(
      "ElevenLabs register-call failed",
      elevenRes.status,
      raw.slice(0, 500)
    );
    return errorSay("Could not connect the AI agent. Check ElevenLabs logs.");
  }

  const contentType = elevenRes.headers.get("content-type") ?? "";

  if (contentType.includes("json") || raw.trim().startsWith("{")) {
    try {
      const j = JSON.parse(raw) as { twiml?: string; twiml_xml?: string };
      const twiml = j.twiml ?? j.twiml_xml;
      if (twiml?.trim()) {
        return twimlResponse(twiml.trim());
      }
    } catch {
      // fall through — might still be XML
    }
  }

  const trimmed = raw.trim();
  if (trimmed.startsWith("<?xml") || trimmed.startsWith("<Response")) {
    return twimlResponse(trimmed);
  }

  console.error("twiml: unexpected ElevenLabs response", trimmed.slice(0, 200));
  return errorSay("Unexpected response from voice provider.");
}

export async function GET(request: Request) {
  return handleTwiml(request);
}

export async function POST(request: Request) {
  return handleTwiml(request);
}
