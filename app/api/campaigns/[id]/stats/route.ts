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

  const grouped = await prisma.call.groupBy({
    by: ["status"],
    where: { campaignId: params.id },
    _count: { _all: true },
  });

  const counts: Record<string, number> = {};
  for (const g of grouped) {
    counts[g.status] = g._count._all;
  }

  const total = await prisma.call.count({ where: { campaignId: params.id } });
  const pending = counts["queued"] ?? 0;
  const initiated = counts["initiated"] ?? 0;
  const inProgress = counts["in_progress"] ?? 0;
  const completed = counts["completed"] ?? 0;
  const failed = counts["failed"] ?? 0;

  const answerRate =
    total > 0 ? Math.round((completed / total) * 10000) / 100 : 0;

  return NextResponse.json({
    total,
    pending,
    initiated,
    inProgress,
    completed,
    failed,
    answerRate,
  });
}
