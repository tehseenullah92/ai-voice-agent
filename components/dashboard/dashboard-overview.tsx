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
  Sparkles,
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
  const completedSteps = SETUP_STEPS.filter((s) => data.setup[s.key]).length;
  const nextStep = SETUP_STEPS.find((s) => !data.setup[s.key]);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Hero / welcome */}
      <section
        className={cn(
          "relative overflow-hidden rounded-2xl border border-border bg-card",
          "shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.08)]",
          "dark:shadow-[0_1px_2px_rgba(0,0,0,0.4),0_12px_32px_-16px_rgba(0,0,0,0.6)]"
        )}
      >
        {/* Decorative gradient ribbon */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px"
          style={{ background: "var(--gradient-primary)" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full opacity-[0.12] blur-3xl"
          style={{ background: "var(--gradient-primary)" }}
        />
        <div className="relative flex flex-col gap-5 px-5 py-6 sm:px-7 sm:py-7 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary">
              <Sparkles className="size-3" strokeWidth={2} />
              {data.setup.isComplete ? "Workspace ready" : "Getting started"}
            </span>
            <h2 className="text-[22px] font-semibold tracking-tight text-foreground sm:text-[26px]">
              Welcome back, {displayName}
            </h2>
            <p className="max-w-xl text-[13.5px] leading-relaxed text-muted-foreground">
              {data.setup.isComplete
                ? "Your workspace is configured and ready. Here\u2019s how your campaigns are performing."
                : "Complete the steps below to start placing AI-powered calls with your contacts."}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {data.setup.isComplete ? (
              <>
                <Link
                  href="/dashboard/campaigns/new"
                  className={buttonVariants({ variant: "default", size: "lg" })}
                >
                  New campaign
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="/dashboard/campaigns"
                  className={buttonVariants({ variant: "outline", size: "lg" })}
                >
                  View campaigns
                </Link>
              </>
            ) : nextStep ? (
              <Link
                href={nextStep.href}
                className={buttonVariants({ variant: "default", size: "lg" })}
              >
                {nextStep.cta}
                <ArrowRight className="size-4" />
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      {/* Setup progress (shown until complete) */}
      {!data.setup.isComplete && (
        <SetupProgress setup={data.setup} completedSteps={completedSteps} />
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Megaphone className="size-4" />}
          label="Active Campaigns"
          value={data.stats.activeCampaigns}
          subtext={
            data.stats.totalCampaigns > 0
              ? `${data.stats.totalCampaigns} total`
              : undefined
          }
          accent="emerald"
        />
        <StatCard
          icon={<PhoneCall className="size-4" />}
          label="Calls Today"
          value={data.stats.callsToday}
          accent="blue"
        />
        <StatCard
          icon={<Phone className="size-4" />}
          label="Total Calls"
          value={data.stats.totalCalls}
          accent="indigo"
        />
        <StatCard
          icon={<Percent className="size-4" />}
          label="Answer Rate"
          value={data.stats.answerRate}
          suffix="%"
          accent="amber"
        />
      </div>

      {/* Quick action card when setup is complete but no activity yet */}
      {data.setup.isComplete && data.stats.totalCalls === 0 && (
        <div
          className={cn(
            "relative overflow-hidden rounded-2xl border border-border bg-card px-5 py-5 sm:px-6 sm:py-6",
            "shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.08)]"
          )}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -left-12 -top-12 size-48 rounded-full opacity-[0.08] blur-3xl"
            style={{ background: "var(--gradient-primary)" }}
          />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start">
            <div
              className="flex size-11 shrink-0 items-center justify-center rounded-xl text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_4px_12px_-2px_rgba(79,70,229,0.35)]"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Zap className="size-5" strokeWidth={2} />
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-[15px] font-semibold tracking-tight text-foreground">
                Ready to make your first call
              </p>
              <p className="text-[13px] leading-relaxed text-muted-foreground">
                Your workspace is fully configured. Create a campaign with your
                contacts and launch it to start making AI-powered calls.
              </p>
              <div className="flex flex-wrap gap-2 pt-3">
                <Link
                  href="/dashboard/campaigns/new"
                  className={buttonVariants({ variant: "default", size: "sm" })}
                >
                  Create Campaign
                </Link>
                <Link
                  href="/dashboard/campaigns"
                  className={buttonVariants({ variant: "outline", size: "sm" })}
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
    <div
      className={cn(
        "rounded-2xl border border-border bg-card p-5 sm:p-6",
        "shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.06)]",
        "dark:shadow-[0_1px_2px_rgba(0,0,0,0.35),0_12px_32px_-18px_rgba(0,0,0,0.6)]"
      )}
    >
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="space-y-0.5">
          <h3 className="text-[15px] font-semibold tracking-tight text-foreground">
            Get started with Convaire
          </h3>
          <p className="text-[12.5px] text-muted-foreground">
            {completedSteps} of {total} steps complete
          </p>
        </div>
        <span className="text-xs font-medium tabular-nums text-muted-foreground">
          {pct}%
        </span>
      </div>

      <div className="mb-5 h-1.5 w-full overflow-hidden rounded-full bg-secondary dark:bg-secondary/80">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${pct}%`,
            background: "var(--gradient-primary)",
          }}
        />
      </div>

      <div className="space-y-2.5">
        {SETUP_STEPS.map((step, i) => {
          const done = setup[step.key];
          const isNext =
            !done && SETUP_STEPS.slice(0, i).every((s) => setup[s.key]);

          return (
            <div
              key={step.key}
              className={cn(
                "flex flex-col gap-3 rounded-xl border px-4 py-3.5 transition-colors sm:flex-row sm:items-center",
                done
                  ? "border-emerald-200/80 bg-emerald-50/80 dark:border-emerald-500/25 dark:bg-emerald-500/[0.07]"
                  : isNext
                    ? "border-primary/25 bg-primary/[0.05] shadow-[inset_0_0_0_1px_rgba(79,70,229,0.06)] dark:border-primary/30 dark:bg-primary/[0.06]"
                    : "border-border bg-secondary/40 dark:bg-secondary/30"
              )}
            >
              <div className="flex flex-1 items-start gap-3">
                <div
                  className={cn(
                    "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold",
                    done
                      ? "border-emerald-300 bg-emerald-100 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/20 dark:text-emerald-300"
                      : isNext
                        ? "border-primary/40 bg-primary/15 text-primary"
                        : "border-border bg-card text-muted-foreground"
                  )}
                >
                  {done ? <Check className="size-3.5" /> : i + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "text-[13.5px] font-medium",
                      done
                        ? "text-emerald-700 line-through decoration-emerald-400/50 dark:text-emerald-400 dark:decoration-emerald-500/40"
                        : "text-foreground"
                    )}
                  >
                    {step.label}
                  </p>
                  <p className="mt-0.5 text-[12.5px] leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
              {!done && (
                <Link
                  href={step.href}
                  className={buttonVariants({
                    variant: isNext ? "default" : "outline",
                    size: "sm",
                    className: "shrink-0 self-start sm:self-auto",
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

const ACCENT_STYLES: Record<
  string,
  { iconWrap: string; bar: string; value: string }
> = {
  emerald: {
    iconWrap: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    bar: "bg-emerald-500/70",
    value: "text-foreground",
  },
  blue: {
    iconWrap: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    bar: "bg-blue-500/70",
    value: "text-foreground",
  },
  indigo: {
    iconWrap: "bg-primary/10 text-primary",
    bar: "bg-primary/70",
    value: "text-foreground",
  },
  amber: {
    iconWrap: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    bar: "bg-amber-500/70",
    value: "text-foreground",
  },
};

function StatCard({
  icon,
  label,
  value,
  suffix,
  subtext,
  accent = "indigo",
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix?: string;
  subtext?: string;
  accent?: keyof typeof ACCENT_STYLES;
}) {
  const styles = ACCENT_STYLES[accent] ?? ACCENT_STYLES.indigo;
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border bg-card px-4 py-4 transition-all sm:px-5 sm:py-5",
        "shadow-[0_1px_2px_rgba(15,23,42,0.04)]",
        "hover:shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_20px_-8px_rgba(15,23,42,0.1)]",
        "dark:shadow-[0_1px_2px_rgba(0,0,0,0.35)]"
      )}
    >
      <div
        aria-hidden
        className={cn(
          "absolute inset-x-0 top-0 h-[2px] opacity-0 transition-opacity group-hover:opacity-100",
          styles.bar
        )}
      />
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
          {label}
        </span>
        <span
          className={cn(
            "flex size-7 items-center justify-center rounded-lg",
            styles.iconWrap
          )}
        >
          {icon}
        </span>
      </div>
      <p
        className={cn(
          "mt-3 text-[28px] font-semibold tabular-nums leading-none tracking-tight",
          styles.value
        )}
      >
        {value.toLocaleString()} 
        {suffix && (
          <span className="text-base font-medium text-muted-foreground pl-1">
            {suffix}
          </span>
        )}
      </p>
      {subtext && (
        <p className="mt-1.5 text-[12px] text-muted-foreground">{subtext}</p>
      )}
    </div>
  );
}

function OverviewSkeleton() {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Hero skeleton */}
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-7">
        <div className="space-y-3">
          <div className="h-5 w-28 animate-pulse rounded-full bg-muted" />
          <div className="h-7 w-64 animate-pulse rounded bg-muted" />
          <div className="h-4 w-80 animate-pulse rounded bg-muted" />
        </div>
      </div>

      {/* Setup progress skeleton */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="mb-4 space-y-2">
          <div className="h-4 w-48 animate-pulse rounded bg-muted" />
          <div className="h-3 w-32 animate-pulse rounded bg-muted" />
        </div>
        <div className="mb-5 h-1.5 w-full animate-pulse rounded-full bg-muted" />
        <div className="space-y-2.5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-xl border border-border bg-muted/30"
            />
          ))}
        </div>
      </div>

      {/* Stat card skeletons */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-border bg-card p-5"
          >
            <div className="h-3 w-24 animate-pulse rounded bg-muted" />
            <div className="mt-4 h-7 w-16 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
