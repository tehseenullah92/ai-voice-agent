import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";

export function DashboardShell({
  children,
  userEmail,
  credits,
}: {
  children: React.ReactNode;
  userEmail: string;
  credits: number;
}) {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar userEmail={userEmail} credits={credits} />
      <div className="pl-[220px]">
        <DashboardHeader />
        <main className="min-h-[calc(100vh-3.5rem)] overflow-auto px-6 py-6">
          {children}
        </main>
      </div>
    </div>
  );
}
