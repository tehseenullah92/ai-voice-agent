import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { FreePlanUpgradeBanner } from "@/components/dashboard/free-plan-upgrade-banner";

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
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar userEmail={userEmail} credits={credits} />
      <div className="pl-[220px]">
        <div className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          {showUpgradeBanner ? <FreePlanUpgradeBanner /> : null}
          <DashboardHeader />
        </div>
        <main className="min-h-[calc(100vh-3.5rem)] overflow-auto px-6 py-6">
          {children}
        </main>
      </div>
    </div>
  );
}
