import Stripe from "stripe";

import { prisma } from "@/lib/prisma";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
    _stripe = new Stripe(key, { apiVersion: "2026-03-25.dahlia" });
  }
  return _stripe;
}

/**
 * Return the Stripe customer ID for a user, creating one if needed.
 * Also ensures the local Subscription row exists (with at least the customerId).
 */
export async function getOrCreateStripeCustomer(
  userId: string
): Promise<string> {
  const sub = await prisma.subscription.findUnique({
    where: { userId },
    select: { stripeCustomerId: true },
  });

  if (sub) return sub.stripeCustomerId;

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { email: true },
  });

  const customer = await getStripe().customers.create({
    email: user.email,
    metadata: { userId },
  });

  await prisma.subscription.create({
    data: {
      userId,
      stripeCustomerId: customer.id,
      plan: "starter",
      status: "incomplete",
    },
  });

  return customer.id;
}
