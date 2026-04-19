import { NextRequest, NextResponse } from "next/server";

import { resolveElevenLabsVoiceId } from "@/lib/elevenlabs";
import { VOICE_OPTIONS, type VoiceId } from "@/lib/campaign-wizard-types";

const ALLOWED = new Set<string>(VOICE_OPTIONS.map((v) => v.id));

export async function GET(req: NextRequest) {
  const voiceId = req.nextUrl.searchParams.get("voiceId")?.trim() ?? "";
  if (!ALLOWED.has(voiceId)) {
    return NextResponse.json({ error: "Invalid voice" }, { status: 400 });
  }

  const key = process.env.ELEVENLABS_API_KEY?.trim();
  if (!key) {
    return NextResponse.json(
      { error: "Voice preview is not configured." },
      { status: 503 }
    );
  }

  const elevenId = resolveElevenLabsVoiceId(voiceId as VoiceId);
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(elevenId)}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": key,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text: "Hi — this is a short preview of how this voice will sound on your outbound calls.",
        model_id: "eleven_turbo_v2_5",
      }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json(
      { error: text.slice(0, 200) || "TTS request failed" },
      { status: res.status >= 400 && res.status < 600 ? res.status : 502 }
    );
  }

  const buf = await res.arrayBuffer();
  return new NextResponse(buf, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
