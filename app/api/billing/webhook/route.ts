import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { addCredits } from "@/lib/billing/credits";
import { PLANS, planKeyFromPriceId } from "@/lib/billing/plans";
import { getStripe } from "@/lib/billing/stripe";
import { prisma } from "@/lib/prisma";

/**
 * Extract `current_period_end` from a Stripe subscription.
 * In newer API versions this lives on each SubscriptionItem, not the top-level object.
 */
function periodEndFromSubscription(
  sub: Record<string, unknown>
): number | null {
  // Legacy top-level field
  if (typeof sub.current_period_end === "number") return sub.current_period_end;
  // Newer: items.data[0].current_period_end
  const items = sub.items as { data?: Array<Record<string, unknown>> } | undefined;
  const first = items?.data?.[0];
  if (first && typeof first.current_period_end === "number") {
    return first.current_period_end;
  }
  return null;
}

/**
 * Resolve the Stripe subscription ID from an invoice.
 * Newer API versions use `parent.subscription_details.subscription`; older ones use `subscription`.
 */
function subscriptionIdFromInvoice(
  invoice: Record<string, unknown>
): string | null {
  // Legacy: invoice.subscription
  if (typeof invoice.subscription === "string") return invoice.subscription;
  if (
    invoice.subscription &&
    typeof invoice.subscription === "object" &&
    typeof (invoice.subscription as { id?: string }).id === "string"
  ) {
    return (invoice.subscription as { id: string }).id;
  }
  // Newer: parent.subscription_details.subscription
  const parent = invoice.parent as Record<string, unknown> | undefined;
  const subDetails = parent?.subscription_details as
    | Record<string, unknown>
    | undefined;
  if (typeof subDetails?.subscription === "string") {
    return subDetails.subscription;
  }
  if (
    subDetails?.subscription &&
    typeof subDetails.subscription === "object" &&
    typeof (subDetails.subscription as { id?: string }).id === "string"
  ) {
    return (subDetails.subscription as { id: string }).id;
  }
  return null;
}

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json(
      { error: "Server misconfiguration" },
      { status: 500 }
    );
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(
          event.data.object as Stripe.Checkout.Session
        );
        break;

      case "invoice.paid":
        await handleInvoicePaid(
          event.data.object as unknown as Record<string, unknown>
        );
        break;

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(
          event.data.object as unknown as Record<string, unknown>
        );
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(
          event.data.object as unknown as Record<string, unknown>
        );
        break;
    }
  } catch (err) {
    console.error(`Error handling Stripe event ${event.type}:`, err);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  if (session.mode !== "subscription" || !session.subscription) return;

  const userId =
    session.metadata?.userId ??
    (typeof session.customer === "string"
      ? (
          await prisma.subscription.findUnique({
            where: { stripeCustomerId: session.customer },
            select: { userId: true },
          })
        )?.userId
      : undefined);

  if (!userId) {
    console.error("checkout.session.completed: no userId resolved");
    return;
  }

  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription.id;

  const subscription = (await getStripe().subscriptions.retrieve(
    subscriptionId
  )) as unknown as Record<string, unknown>;

  const items = subscription.items as
    | { data?: Array<{ price?: { id?: string }; current_period_end?: number }> }
    | undefined;
  const firstItem = items?.data?.[0];
  const priceId = firstItem?.price?.id;
  const planKey = priceId ? planKeyFromPriceId(priceId) : null;
  const plan = planKey ?? (session.metadata?.plan as string) ?? "starter";
  const credits =
    PLANS[plan as keyof typeof PLANS]?.monthlyCredits ??
    PLANS.starter.monthlyCredits;

  const customerId =
    typeof session.customer === "string"
      ? session.customer
      : session.customer?.id ?? "";

  const periodEnd = periodEndFromSubscription(subscription);

  await prisma.subscription.upsert({
    where: { userId },
    update: {
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      stripePriceId: priceId ?? null,
      plan,
      status: String(subscription.status ?? "active"),
      currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
    },
    create: {
      userId,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      stripePriceId: priceId ?? null,
      plan,
      status: String(subscription.status ?? "active"),
      currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
    },
  });

  await addCredits(
    userId,
    credits,
    "subscription_renewal",
    `${PLANS[plan as keyof typeof PLANS]?.name ?? plan} plan — first month`
  );
}

async function handleInvoicePaid(invoice: Record<string, unknown>) {
  const subscriptionId = subscriptionIdFromInvoice(invoice);
  if (!subscriptionId) return;

  const sub = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: subscriptionId },
    select: { userId: true, plan: true },
  });

  if (!sub) return;

  if (invoice.billing_reason === "subscription_create") {
    return;
  }

  const planDef = PLANS[sub.plan as keyof typeof PLANS];
  const credits = planDef?.monthlyCredits ?? PLANS.starter.monthlyCredits;

  await addCredits(
    sub.userId,
    credits,
    "subscription_renewal",
    `${planDef?.name ?? sub.plan} plan — monthly renewal`
  );
}

async function handleSubscriptionUpdated(
  subscription: Record<string, unknown>
) {
  const subscriptionId = String(subscription.id);

  const sub = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: subscriptionId },
  });

  if (!sub) return;

  const items = subscription.items as
    | { data?: Array<{ price?: { id?: string } }> }
    | undefined;
  const priceId = items?.data?.[0]?.price?.id;
  const planKey = priceId ? planKeyFromPriceId(priceId) : null;
  const periodEnd = periodEndFromSubscription(subscription);

  await prisma.subscription.update({
    where: { id: sub.id },
    data: {
      status: String(subscription.status ?? sub.status),
      stripePriceId: priceId ?? sub.stripePriceId,
      plan: planKey ?? sub.plan,
      currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : sub.currentPeriodEnd,
    },
  });
}

async function handleSubscriptionDeleted(
  subscription: Record<string, unknown>
) {
  const subscriptionId = String(subscription.id);

  await prisma.subscription.updateMany({
    where: { stripeSubscriptionId: subscriptionId },
    data: { status: "canceled" },
  });
}
