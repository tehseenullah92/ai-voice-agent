import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireWorkspaceContext } from "@/lib/workspace";

type Params = { params: { id: string } };

export async function GET(_request: Request, { params }: Params) {
  const gate = await requireWorkspaceContext();
  if (!gate.ok) return gate.response;
  const { workspaceId } = gate.ctx;

  const campaign = await prisma.campaign.findFirst({
    where: { id: params.id, workspaceId },
    select: { id: true },
  });

  if (!campaign) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const calls = await prisma.call.findMany({
    where: { campaignId: params.id },
    include: { contact: { select: { phone: true, data: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(calls);
}
