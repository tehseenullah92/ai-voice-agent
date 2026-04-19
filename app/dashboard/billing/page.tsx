import { redirect } from "next/navigation";

import { BillingClient } from "@/components/billing/billing-client";
import {
  hasEntitlingSubscription,
  PLANS,
  type PlanKey,
} from "@/lib/billing/plans";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export default async function BillingPage({
  searchParams,
}: {
  searchParams: { afterSignup?: string };
}) {
  const session = await getSession();
  if (!session) redirect("/login");

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

  if (!user) redirect("/api/auth/clear-session");

  const transactions = await prisma.creditTransaction.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      amount: true,
      type: true,
      description: true,
      createdAt: true,
    },
  });

  const sub = user.subscription;
  const activePlan =
    sub && hasEntitlingSubscription(sub.status)
      ? (sub.plan as PlanKey)
      : null;

  const plans = (Object.entries(PLANS) as [PlanKey, (typeof PLANS)[PlanKey]][]).map(
    ([key, plan]) => ({
      key,
      name: plan.name,
      priceDisplay: plan.priceDisplay,
      monthlyCredits: plan.monthlyCredits,
      isCurrent: activePlan === key,
    })
  );

  const afterSignup = searchParams.afterSignup === "1";

  return (
    <div className="mx-auto max-w-3xl space-y-10 pb-16">
      <BillingClient
        credits={user.credits}
        subscriptionStatus={sub?.status ?? null}
        currentPeriodEnd={sub?.currentPeriodEnd?.toISOString() ?? null}
        plans={plans}
        subscribePrompt={afterSignup}
        transactions={transactions.map((t) => ({
          ...t,
          createdAt: t.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
