import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth/session";
import { getOrCreateStripeCustomer, getStripe } from "@/lib/billing/stripe";
import { publicAbsoluteUrl } from "@/lib/public-app-url";

export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const customerId = await getOrCreateStripeCustomer(session.userId);

  const portalSession = await getStripe().billingPortal.sessions.create({
    customer: customerId,
    return_url: publicAbsoluteUrl("/dashboard/billing"),
  });

  return NextResponse.json({ url: portalSession.url });
}
