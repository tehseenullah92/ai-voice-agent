"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Check,
  Megaphone,
  Percent,
  Phone,
  PhoneCall,
  Zap,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { emailDisplayName } from "@/lib/user-display";
import { cn } from "@/lib/utils";

type SetupState = {
  twilioConnected: boolean;
  hasNumbers: boolean;
  hasCampaigns: boolean;
  isComplete: boolean;
};

type Stats = {
  activeCampaigns: number;
  totalCampaigns: number;
  totalCalls: number;
  callsToday: number;
  answerRate: number;
};

type DashboardData = {
  userEmail: string;
  setup: SetupState;
  stats: Stats;
};

const SETUP_STEPS = [
  {
    key: "twilioConnected" as const,
    label: "Connect Twilio",
    description: "Link your Twilio account to enable outbound calls.",
    href: "/dashboard/settings",
    cta: "Go to Settings",
  },
  {
    key: "hasNumbers" as const,
    label: "Sync phone numbers",
    description: "Import your Twilio numbers so you can place calls.",
    href: "/dashboard/phone-numbers",
    cta: "Manage Numbers",
  },
  {
    key: "hasCampaigns" as const,
    label: "Create a campaign",
    description: "Set up your first AI calling campaign.",
    href: "/dashboard/campaigns/new",
    cta: "New Campaign",
  },
];

export function DashboardOverview() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/dashboard/stats");
        if (!res.ok) throw new Error("Failed to load");
        const json = (await res.json()) as DashboardData;
        if (!cancelled) setData(json);
      } catch {
        // silently degrade — show skeleton
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <OverviewSkeleton />;
  }

  if (!data) {
    return (
      <p className="text-sm text-muted-foreground">
        Could not load dashboard data.
      </p>
    );
  }

  const displayName = emailDisplayName(data.userEmail);
  const completedSteps = SETUP_STEPS.filter(
    (s) => data.setup[s.key]
  ).length;
  const nextStep = SETUP_STEPS.find((s) => !data.setup[s.key]);

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Welcome back, {displayName}
          </h2>
          <p className="text-[13px] text-muted-foreground">
            {data.setup.isComplete
              ? "Your workspace is ready. Here\u2019s how your campaigns are performing."
              : "Complete the setup below to start making AI calls."}
          </p>
        </div>
        {data.setup.isComplete ? (
          <Link
            href="/dashboard/campaigns/new"
            className={buttonVariants({ variant: "default" })}
          >
            New Campaign
          </Link>
        ) : nextStep ? (
          <Link
            href={nextStep.href}
            className={buttonVariants({ variant: "default" })}
          >
            {nextStep.cta}
            <ArrowRight className="ml-1.5 size-4" />
          </Link>
        ) : null}
      </div>

      {/* Setup progress (shown until complete) */}
      {!data.setup.isComplete && (
        <SetupProgress setup={data.setup} completedSteps={completedSteps} />
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          icon={<Megaphone className="size-4" />}
          label="Active Campaigns"
          value={data.stats.activeCampaigns}
          subtext={
            data.stats.totalCampaigns > 0
              ? `${data.stats.totalCampaigns} total`
              : undefined
          }
          color="text-emerald-400"
        />
        <StatCard
          icon={<PhoneCall className="size-4" />}
          label="Calls Today"
          value={data.stats.callsToday}
          color="text-blue-400"
        />
        <StatCard
          icon={<Phone className="size-4" />}
          label="Total Calls"
          value={data.stats.totalCalls}
        />
        <StatCard
          icon={<Percent className="size-4" />}
          label="Answer Rate"
          value={data.stats.answerRate}
          suffix="%"
          color="text-amber-400"
        />
      </div>

      {/* Quick actions when setup is complete but no activity yet */}
      {data.setup.isComplete && data.stats.totalCalls === 0 && (
        <div className="rounded-xl border border-border bg-card/60 px-5 py-5">
          <div className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Zap className="size-4 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                Ready to make your first call
              </p>
              <p className="text-[13px] text-muted-foreground">
                Your workspace is fully configured. Create a campaign with your
                contacts and launch it to start making AI-powered calls.
              </p>
              <div className="flex gap-2 pt-2">
                <Link
                  href="/dashboard/campaigns/new"
                  className={buttonVariants({
                    variant: "default",
                    size: "sm",
                  })}
                >
                  Create Campaign
                </Link>
                <Link
                  href="/dashboard/campaigns"
                  className={buttonVariants({
                    variant: "outline",
                    size: "sm",
                  })}
                >
                  View Campaigns
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SetupProgress({
  setup,
  completedSteps,
}: {
  setup: SetupState;
  completedSteps: number;
}) {
  const total = SETUP_STEPS.length;
  const pct = Math.round((completedSteps / total) * 100);

  return (
    <div className="rounded-xl border border-border bg-card/60 p-5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="space-y-0.5">
          <h3 className="text-sm font-medium text-foreground">
            Get started with Convaire
          </h3>
          <p className="text-[12px] text-muted-foreground">
            {completedSteps} of {total} steps complete
          </p>
        </div>
        <span className="text-xs font-medium tabular-nums text-muted-foreground">
          {pct}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {SETUP_STEPS.map((step, i) => {
          const done = setup[step.key];
          const isNext =
            !done && SETUP_STEPS.slice(0, i).every((s) => setup[s.key]);

          return (
            <div
              key={step.key}
              className={cn(
                "flex items-start gap-3 rounded-lg border px-4 py-3 transition-colors",
                done
                  ? "border-emerald-500/20 bg-emerald-500/5"
                  : isNext
                    ? "border-primary/30 bg-primary/5"
                    : "border-border bg-muted/20"
              )}
            >
              <div
                className={cn(
                  "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-medium",
                  done
                    ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-400"
                    : isNext
                      ? "border-primary/40 bg-primary/20 text-primary"
                      : "border-border bg-muted text-muted-foreground"
                )}
              >
                {done ? <Check className="size-3" /> : i + 1}
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "text-[13px] font-medium",
                    done
                      ? "text-emerald-400 line-through decoration-emerald-500/30"
                      : "text-foreground"
                  )}
                >
                  {step.label}
                </p>
                <p className="mt-0.5 text-[12px] text-muted-foreground">
                  {step.description}
                </p>
              </div>
              {!done && (
                <Link
                  href={step.href}
                  className={buttonVariants({
                    variant: isNext ? "default" : "outline",
                    size: "sm",
                    className: "shrink-0",
                  })}
                >
                  {step.cta}
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  suffix,
  subtext,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix?: string;
  subtext?: string;
  color?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card/40 px-4 py-4">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="text-[11px] font-medium uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p
        className={cn(
          "mt-2 text-2xl font-semibold tabular-nums",
          color ?? "text-foreground"
        )}
      >
        {value.toLocaleString()}
        {suffix && (
          <span className="text-base font-medium text-muted-foreground">
            {suffix}
          </span>
        )}
      </p>
      {subtext && (
        <p className="mt-0.5 text-[12px] text-muted-foreground">{subtext}</p>
      )}
    </div>
  );
}

function OverviewSkeleton() {
  return (
    <div className="space-y-8">
      {/* Welcome skeleton */}
      <div className="space-y-2">
        <div className="h-6 w-56 animate-pulse rounded bg-muted" />
        <div className="h-4 w-80 animate-pulse rounded bg-muted" />
      </div>

      {/* Setup progress skeleton */}
      <div className="rounded-xl border border-border bg-card/60 p-5">
        <div className="mb-4 space-y-2">
          <div className="h-4 w-48 animate-pulse rounded bg-muted" />
          <div className="h-3 w-32 animate-pulse rounded bg-muted" />
        </div>
        <div className="mb-5 h-1.5 w-full animate-pulse rounded-full bg-muted" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-lg border border-border bg-muted/30"
            />
          ))}
        </div>
      </div>

      {/* Stat card skeletons */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-card/40 px-4 py-4"
          >
            <div className="h-3 w-24 animate-pulse rounded bg-muted" />
            <div className="mt-3 h-7 w-12 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
