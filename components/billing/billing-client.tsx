"use client";

import { useState } from "react";
import { Check, CreditCard, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type PlanInfo = {
  key: string;
  name: string;
  priceDisplay: string;
  monthlyCredits: number;
  isCurrent: boolean;
};

type Transaction = {
  id: string;
  amount: number;
  type: string;
  description: string | null;
  createdAt: string;
};

type Props = {
  credits: number;
  activePlan: string | null;
  subscriptionStatus: string | null;
  currentPeriodEnd: string | null;
  plans: PlanInfo[];
  transactions: Transaction[];
};

function typeLabel(type: string): string {
  switch (type) {
    case "signup_bonus":
      return "Signup Bonus";
    case "subscription_renewal":
      return "Subscription";
    case "call_usage":
      return "Call Usage";
    case "manual_adjustment":
      return "Adjustment";
    default:
      return type;
  }
}

export function BillingClient({
  credits,
  activePlan,
  subscriptionStatus,
  currentPeriodEnd,
  plans,
  transactions,
}: Props) {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [loadingPortal, setLoadingPortal] = useState(false);

  async function handleSubscribe(planKey: string) {
    setLoadingPlan(planKey);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planKey }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error ?? "Could not start checkout.");
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setLoadingPlan(null);
    }
  }

  async function handleManage() {
    setLoadingPortal(true);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error ?? "Could not open portal.");
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setLoadingPortal(false);
    }
  }

  const hasActiveSubscription = subscriptionStatus === "active";

  return (
    <>
      {/* Credit Balance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="size-4" />
            Credit Balance
          </CardTitle>
          <CardDescription>
            Credits are used for AI calls. 1 credit = 1 minute of call time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold tabular-nums text-foreground">
              {credits.toLocaleString()}
            </span>
            <span className="text-sm text-muted-foreground">credits remaining</span>
          </div>
          {hasActiveSubscription && currentPeriodEnd && (
            <p className="mt-2 text-xs text-muted-foreground">
              Next renewal:{" "}
              {new Date(currentPeriodEnd).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          )}
        </CardContent>
        {hasActiveSubscription && (
          <CardFooter>
            <Button
              variant="outline"
              size="sm"
              disabled={loadingPortal}
              onClick={handleManage}
            >
              {loadingPortal ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <CreditCard className="size-3.5" />
              )}
              Manage Subscription
            </Button>
          </CardFooter>
        )}
      </Card>

      {/* Plan Cards */}
      <div>
        <h2 className="mb-4 text-base font-medium text-foreground">
          {hasActiveSubscription ? "Your Plan" : "Choose a Plan"}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {plans.map((plan) => (
            <Card
              key={plan.key}
              className={
                plan.isCurrent
                  ? "ring-2 ring-primary"
                  : ""
              }
            >
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.priceDisplay}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Check className="size-4 text-primary" />
                  <span>
                    <strong>{plan.monthlyCredits.toLocaleString()}</strong> credits / month
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="size-4 text-primary" />
                  <span>Unlimited campaigns</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="size-4 text-primary" />
                  <span>AI voice calling</span>
                </div>
              </CardContent>
              <CardFooter>
                {plan.isCurrent ? (
                  <span className="text-xs font-medium text-primary">
                    Current plan
                  </span>
                ) : (
                  <Button
                    size="sm"
                    variant={hasActiveSubscription ? "outline" : "default"}
                    disabled={loadingPlan !== null}
                    onClick={() => handleSubscribe(plan.key)}
                  >
                    {loadingPlan === plan.key && (
                      <Loader2 className="size-3.5 animate-spin" />
                    )}
                    {hasActiveSubscription ? "Switch Plan" : "Subscribe"}
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/* Transaction History */}
      {transactions.length > 0 && (
        <div>
          <h2 className="mb-4 text-base font-medium text-foreground">
            Recent Credit Activity
          </h2>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs text-muted-foreground">
                      <th className="px-4 py-2.5 font-medium">Date</th>
                      <th className="px-4 py-2.5 font-medium">Type</th>
                      <th className="px-4 py-2.5 font-medium">Description</th>
                      <th className="px-4 py-2.5 text-right font-medium">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr
                        key={tx.id}
                        className="border-b last:border-0"
                      >
                        <td className="whitespace-nowrap px-4 py-2.5 text-muted-foreground">
                          {new Date(tx.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </td>
                        <td className="px-4 py-2.5">{typeLabel(tx.type)}</td>
                        <td className="max-w-[200px] truncate px-4 py-2.5 text-muted-foreground">
                          {tx.description ?? "—"}
                        </td>
                        <td
                          className={`whitespace-nowrap px-4 py-2.5 text-right tabular-nums font-medium ${
                            tx.amount > 0
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {tx.amount > 0 ? "+" : ""}
                          {tx.amount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
