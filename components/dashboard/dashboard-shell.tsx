"use client";

import { useState } from "react";

import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { FreePlanUpgradeBanner } from "@/components/dashboard/free-plan-upgrade-banner";
import { Sheet, SheetContent } from "@/components/ui/sheet";

export function DashboardShell({
  children,
  userEmail,
  credits,
  showUpgradeBanner,
}: {
  children: React.ReactNode;
  userEmail: string;
  credits: number;
  showUpgradeBanner: boolean;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] bg-app-mesh opacity-70" />

      {/* Desktop sidebar (>= md) */}
      <AppSidebar userEmail={userEmail} credits={credits} variant="desktop" />

      {/* Mobile drawer (< md) */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0">
          <AppSidebar
            userEmail={userEmail}
            credits={credits}
            variant="drawer"
            onNavigate={() => setMobileOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Main column: flex-1 fills viewport under sticky chrome — avoids min-h calc overflow */}
      <div className="flex min-h-0 flex-1 flex-col md:pl-[244px]">
        <div className="sticky top-0 z-30 shrink-0">
          {showUpgradeBanner ? <FreePlanUpgradeBanner /> : null}
          <DashboardHeader onOpenMobileNav={() => setMobileOpen(true)} />
        </div>
        <main className="flex min-h-0 flex-1 flex-col px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-[1280px] flex-1">{children}</div>
        </main>
      </div>
    </div>
  );
}
