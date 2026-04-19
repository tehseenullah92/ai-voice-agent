import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireWorkspaceContext } from "@/lib/workspace";

export async function POST() {
  const gate = await requireWorkspaceContext();
  if (!gate.ok) return gate.response;
  const { workspaceId } = gate.ctx;

  await prisma.workspace.update({
    where: { id: workspaceId },
    data: {
      twilioSid: null,
      twilioToken: null,
      twilioNumber: null,
      twilioIncomingNumbers: Prisma.DbNull,
    },
  });

  return NextResponse.json({ success: true });
}
