import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireWorkspaceContext } from "@/lib/workspace";

const ELEVEN_BASE = "https://api.elevenlabs.io/v1";

type Params = { params: { id: string } };

export async function GET(_request: Request, { params }: Params) {
  const gate = await requireWorkspaceContext();
  if (!gate.ok) return gate.response;
  const { workspaceId } = gate.ctx;

  const call = await prisma.call.findUnique({
    where: { id: params.id },
    include: { campaign: { select: { workspaceId: true } } },
  });

  if (!call || call.campaign.workspaceId !== workspaceId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!call.elevenLabsConvId) {
    return NextResponse.json(
      { error: "No ElevenLabs conversation linked to this call" },
      { status: 404 }
    );
  }

  const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      { error: "ElevenLabs API key not configured" },
      { status: 500 }
    );
  }

  const res = await fetch(
    `${ELEVEN_BASE}/convai/conversations/${encodeURIComponent(call.elevenLabsConvId)}`,
    { headers: { "xi-api-key": apiKey } }
  );

  if (!res.ok) {
    const text = await res.text();
    console.error("ElevenLabs conversation fetch failed", res.status, text.slice(0, 300));
    return NextResponse.json(
      { error: "Failed to fetch conversation details" },
      { status: 502 }
    );
  }

  const data = await res.json();
  return NextResponse.json(data);
}
