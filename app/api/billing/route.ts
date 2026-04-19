import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth/session";
import { PLANS } from "@/lib/billing/plans";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      credits: true,
      subscription: {
        select: {
          plan: true,
          status: true,
          currentPeriodEnd: true,
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const sub = user.subscription;
  const planKey = sub?.plan as keyof typeof PLANS | undefined;
  const planDef = planKey ? PLANS[planKey] : null;

  return NextResponse.json({
    credits: user.credits,
    plan: sub
      ? {
          key: sub.plan,
          name: planDef?.name ?? sub.plan,
          status: sub.status,
          currentPeriodEnd: sub.currentPeriodEnd,
          monthlyCredits: planDef?.monthlyCredits ?? null,
        }
      : null,
  });
}
