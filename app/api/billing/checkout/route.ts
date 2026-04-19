import { NextResponse } from "next/server";
import { z } from "zod";

import { getSession } from "@/lib/auth/session";
import { PLANS, type PlanKey } from "@/lib/billing/plans";
import { getOrCreateStripeCustomer, getStripe } from "@/lib/billing/stripe";
import { publicAbsoluteUrl } from "@/lib/public-app-url";

const bodySchema = z.object({
  plan: z.enum(["starter", "business"]),
});

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const planKey: PlanKey = parsed.data.plan;
  const plan = PLANS[planKey];

  const customerId = await getOrCreateStripeCustomer(session.userId);

  const checkoutSession = await getStripe().checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: plan.stripePriceId, quantity: 1 }],
    success_url: publicAbsoluteUrl("/dashboard/billing?success=1"),
    cancel_url: publicAbsoluteUrl("/dashboard/billing?canceled=1"),
    subscription_data: {
      metadata: { userId: session.userId, plan: planKey },
    },
    metadata: { userId: session.userId, plan: planKey },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
