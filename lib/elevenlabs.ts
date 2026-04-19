import type { Campaign } from "@prisma/client";

import { getPublicAppUrl } from "@/lib/public-app-url";

const BASE = "https://api.elevenlabs.io/v1";

function headers() {
  return {
    "xi-api-key": process.env.ELEVENLABS_API_KEY!,
    "Content-Type": "application/json",
  };
}

/** Twilio Media Streams use μ-law 8 kHz; ElevenLabs requires matching ASR/TTS (see register-call docs). */
const TWILIO_CONVERSATION_AUDIO = {
  asr: {
    quality: "high" as const,
    provider: "elevenlabs" as const,
    user_input_audio_format: "ulaw_8000" as const,
  },
  tts: {
    model_id: "eleven_flash_v2" as const,
    agent_output_audio_format: "ulaw_8000" as const,
  },
};

export async function syncElevenLabsAgent(campaign: Campaign): Promise<string> {
  const webhookBase = getPublicAppUrl();
  const body = {
    name: campaign.agentName ?? campaign.name,
    conversation_config: {
      ...TWILIO_CONVERSATION_AUDIO,
      agent: {
        prompt: {
          prompt: campaign.instructions ?? "",
          llm: "gpt-4o",
          tools: [
            {
              type: "system",
              name: "end_call",
              description:
                "End the call when the conversation reaches a natural conclusion, the main task is completed, or the user indicates they want to hang up.",
            },
          ],
        },
        first_message: campaign.openingLine ?? "",
        language: "en",
      },
      tts: {
        ...TWILIO_CONVERSATION_AUDIO.tts,
        voice_id: resolveElevenLabsVoiceId(campaign.agentVoice),
      },
      turn: {
        max_duration_seconds: (campaign.maxDuration ?? 5) * 60,
      },
    },
    platform_settings: {
      webhook: {
        url: `${webhookBase}/api/elevenlabs/webhook`,
      },
    },
  };

  if (campaign.elevenLabsAgentId) {
    const res = await fetch(
      `${BASE}/convai/agents/${campaign.elevenLabsAgentId}`,
      {
        method: "PATCH",
        headers: headers(),
        body: JSON.stringify(body),
      }
    );
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`ElevenLabs PATCH failed: ${res.status} ${err}`);
    }
    return campaign.elevenLabsAgentId;
  }

  const res = await fetch(`${BASE}/convai/agents/create`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`ElevenLabs create failed: ${res.status} ${err}`);
  }
  const data = (await res.json()) as { agent_id?: string };
  if (!data.agent_id) {
    throw new Error("ElevenLabs create response missing agent_id");
  }
  return data.agent_id;
}

/** Removes the ConvAI agent from ElevenLabs (best-effort; ignores missing agent). */
export async function deleteElevenLabsAgent(agentId: string | null | undefined) {
  const id = agentId?.trim();
  const key = process.env.ELEVENLABS_API_KEY?.trim();
  if (!id || !key) return;

  const res = await fetch(`${BASE}/convai/agents/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { "xi-api-key": key },
  });
  if (!res.ok && res.status !== 404) {
    const err = await res.text();
    console.error("ElevenLabs delete agent failed", res.status, err.slice(0, 300));
  }
}

/** Wizard voice id, stored label, or legacy id → ElevenLabs `voice_id` for TTS / ConvAI. */
export function resolveElevenLabsVoiceId(
  voice: string | null | undefined
): string {
  return mapVoice(voice);
}

function mapVoice(voice: string | null | undefined): string {
  const map: Record<string, string> = {
    "Calm Male": "pNInz6obpgDQGcFmaJgB",
    "Warm Female": "EXAVITQu4vr4xnSDxMaL",
    "Neutral Male": "VR6AewLTigWG4xSOukaG",
    "Energetic Female": "jsCqWAovK2LkecY7zXl4",
    "calm-male": "pNInz6obpgDQGcFmaJgB",
    "warm-female": "EXAVITQu4vr4xnSDxMaL",
    "neutral-male": "VR6AewLTigWG4xSOukaG",
    "energetic-female": "jsCqWAovK2LkecY7zXl4",
  };
  return map[voice ?? ""] ?? "EXAVITQu4vr4xnSDxMaL";
}
