"use client";

import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { KeyRound, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AccountSettingsCard({ email }: { email: string }) {
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const currentPassword = String(fd.get("currentPassword") ?? "");
    const newPassword = String(fd.get("newPassword") ?? "");
    const confirm = String(fd.get("confirmPassword") ?? "");

    if (newPassword !== confirm) {
      toast.error("New password and confirmation do not match.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        toast.error(data.error ?? "Could not update password.");
        return;
      }
      toast.success("Password updated.");
      e.currentTarget.reset();
    } catch {
      toast.error("Could not reach the server.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-card">
          <KeyRound className="size-4 text-muted-foreground" strokeWidth={1.75} />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">Account</h3>
          <p className="text-[13px] text-muted-foreground">
            Your sign-in credentials for this workspace.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card/60 p-5 space-y-6">
        <div className="space-y-2">
          <Label className="flex items-center gap-1.5">
            <Mail className="size-3.5 text-muted-foreground" />
            Email
          </Label>
          <Input
            readOnly
            value={email}
            disabled
className="h-9 font-mono text-[13px]"
          />
          <p className="text-[12px] text-muted-foreground">
            Email cannot be changed from the app yet.
          </p>
        </div>

        <div className="h-px bg-border" />

        <form onSubmit={(e) => void onSubmit(e)} className="space-y-4">
          <p className="text-sm font-medium text-foreground">Change password</p>
          <div className="grid gap-4 sm:grid-cols-1">
            <div className="space-y-2">
              <Label htmlFor="cur-pw">Current password</Label>
              <Input
                id="cur-pw"
                name="currentPassword"
                type="password"
                autoComplete="current-password"
                required
                className="h-9 bg-background"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="new-pw">New password</Label>
                <Input
                  id="new-pw"
                  name="newPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  className="h-9 bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="conf-pw">Confirm new password</Label>
                <Input
                  id="conf-pw"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  className="h-9 bg-background"
                />
              </div>
            </div>
          </div>
          <Button type="submit" size="sm" disabled={saving}>
            {saving ? "Saving…" : "Update password"}
          </Button>
        </form>
      </div>
    </section>
  );
}
