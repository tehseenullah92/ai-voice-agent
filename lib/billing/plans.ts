export type PlanKey = "starter" | "business";

export type PlanDefinition = {
  name: string;
  monthlyCredits: number;
  stripePriceId: string;
  /** Human-readable price shown in the UI. */
  priceDisplay: string;
};

export const PLANS: Record<PlanKey, PlanDefinition> = {
  starter: {
    name: "Starter",
    monthlyCredits: 150,
    stripePriceId: process.env.STRIPE_STARTER_PRICE_ID!,
    priceDisplay: "$49/mo",
  },
  business: {
    name: "Growth",
    monthlyCredits: 500,
    stripePriceId: process.env.STRIPE_BUSINESS_PRICE_ID!,
    priceDisplay: "$149/mo",
  },
} as const;

/** Cost in credits for various billable actions. */
export const CREDIT_COSTS = {
  callPerMinute: 1,
} as const;

/** Free credits granted to every new user at signup. */
export const SIGNUP_BONUS_CREDITS = 5;

/** Resolve a plan key from its Stripe price ID, or null if unknown. */
export function planKeyFromPriceId(priceId: string): PlanKey | null {
  for (const [key, plan] of Object.entries(PLANS)) {
    if (plan.stripePriceId === priceId) return key as PlanKey;
  }
  return null;
}
