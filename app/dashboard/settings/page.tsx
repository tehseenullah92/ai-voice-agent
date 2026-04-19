import { redirect } from "next/navigation";

import { AccountSettingsCard } from "@/components/settings/account-settings-card";
import { ConnectTwilioCard } from "@/components/settings/connect-twilio-card";
import { DeleteAccountSection } from "@/components/settings/delete-account-section";
import { WorkspaceSettingsCard } from "@/components/settings/workspace-settings-card";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { email: true },
  });

  if (!user) {
    redirect("/api/auth/clear-session");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-10 pb-16">
      <AccountSettingsCard email={user.email} />

      <div className="h-px bg-border" />

      <WorkspaceSettingsCard />

      <div className="h-px bg-border" />

      <ConnectTwilioCard />

      <div className="h-px bg-border" />

      <DeleteAccountSection />
    </div>
  );
}
