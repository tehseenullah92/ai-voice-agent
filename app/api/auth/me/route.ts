import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      createdAt: true,
      workspace: {
        select: {
          name: true,
          defaultTimezone: true,
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const { workspace, ...rest } = user;
  return NextResponse.json({
    user: rest,
    workspace: workspace
      ? {
          name: workspace.name,
          defaultTimezone: workspace.defaultTimezone,
        }
      : null,
  });
}
