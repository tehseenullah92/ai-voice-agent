import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import {
  getOrCreateAuthenticatedUser,
  unauthorizedJsonResponse,
} from "../../../../../lib/server-auth";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getOrCreateAuthenticatedUser(_req);
    if (!user) return unauthorizedJsonResponse();

    const { id: campaignId } = await ctx.params;

    const campaign = await prisma.campaign.findFirst({
      where: { id: campaignId, userId: user.id },
    });
    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    const calls = await prisma.call.findMany({
      where: { campaignId },
      select: { clientId: true, clientName: true, clientPhone: true },
    });

    const seen = new Set<string>();
    const clients = calls
      .filter((c) => {
        const key = c.clientId || c.clientPhone;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .map((c) => ({
        id: c.clientId ?? c.clientPhone,
        name: c.clientName ?? "Unknown",
        phone: c.clientPhone,
        location: "N/A",
        status: "active",
        tags: [] as string[],
      }));

    return NextResponse.json({ clients });
  } catch (err) {
    console.error("GET /api/campaigns/[id]/clients error", err);
    return NextResponse.json({ error: "Failed to load clients" }, { status: 500 });
  }
}
