"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Shown for users without an active/trialing subscription. Hidden on the billing
 * page where plan selection is already primary.
 */
export function FreePlanUpgradeBanner() {
  const pathname = usePathname();
  if (pathname === "/dashboard/billing") {
    return null;
  }

  return (
    <div
      className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 border-b border-primary/20 bg-primary/5 px-6 py-2.5 text-center sm:justify-between sm:text-left"
      role="status"
    >
      <p className="text-[13px] leading-snug text-foreground">
        <span className="font-medium">You&apos;re on the free tier.</span>{" "}
        Subscribe for monthly credits and full access.
      </p>
      <Link
        href="/dashboard/billing"
        className={cn(
          buttonVariants({ size: "sm", className: "h-8 shrink-0 gap-1.5" })
        )}
      >
        View plans
        <ArrowUpRight className="size-3.5 opacity-80" aria-hidden />
      </Link>
    </div>
  );
}
