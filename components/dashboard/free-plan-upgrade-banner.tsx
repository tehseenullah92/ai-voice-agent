"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Shown for users without an active/trialing subscription. Hidden on the billing
 * page where plan selection is already primary.
 *
 * Solid primary background — distinct from the neutral page header below.
 */
export function FreePlanUpgradeBanner() {
  const pathname = usePathname();
  if (pathname === "/dashboard/billing") {
    return null;
  }

  return (
    <div
      role="status"
      className="relative overflow-hidden border-b border-primary bg-primary"
    >
      <div className="relative flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-6 sm:py-3">
        <div className="flex min-w-0 items-start gap-3 sm:items-center">
          <div className="min-w-0 flex-1 space-y-0.5">
            <p className="text-[14px] font-semibold tracking-tight text-primary-foreground">
              You&apos;re on the free tier
            </p>
            <p className="text-[12.5px] leading-relaxed text-white/90">
              Subscribe to unlock monthly credits, full access, and priority
              support.
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/billing"
          className={cn(
            buttonVariants({
              variant: "outline",
              size: "default",
              className:
                "h-9 shrink-0 gap-1.5 self-start border-white/45 bg-white/15 px-4 font-medium text-white shadow-none hover:bg-white/25 sm:self-auto",
            })
          )}
        >
          Upgrade
        </Link>
      </div>
    </div>
  );
}
