import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { email: true, credits: true },
  });

  if (!user) {
    redirect("/api/auth/clear-session");
  }

  return (
    <DashboardShell userEmail={user.email} credits={user.credits}>
      {children}
    </DashboardShell>
  );
}
