import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export type WorkspaceContext = {
  userId: string;
  workspaceId: string;
};

export type WorkspaceGate =
  | { ok: true; ctx: WorkspaceContext }
  | { ok: false; response: NextResponse };

/**
 * Resolve the authenticated user's workspace for API routes (defense in depth with middleware).
 */
export async function requireWorkspaceContext(): Promise<WorkspaceGate> {
  const session = await getSession();
  if (!session) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const workspace = await prisma.workspace.findUnique({
    where: { userId: session.userId },
    select: { id: true },
  });

  if (!workspace) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Workspace not found" },
        { status: 500 }
      ),
    };
  }

  return {
    ok: true,
    ctx: { userId: session.userId, workspaceId: workspace.id },
  };
}
