"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Globe, KeyRound, Loader2, Lock, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { COMMON_TIMEZONES } from "@/lib/campaign-wizard-types";

export function AccountSettingsCard({ email }: { email: string }) {
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingTimezone, setSavingTimezone] = useState(false);
  const [workspaceLoading, setWorkspaceLoading] = useState(true);
  const [timezone, setTimezone] = useState("America/New_York");

  const loadWorkspace = useCallback(async () => {
    setWorkspaceLoading(true);
    try {
      const res = await fetch("/api/workspace");
      const data = (await res.json()) as {
        defaultTimezone?: string | null;
        error?: string;
      };
      if (!res.ok) {
        toast.error(data.error ?? "Could not load preferences.");
        return;
      }
      setTimezone(
        data.defaultTimezone &&
          COMMON_TIMEZONES.some((z) => z.value === data.defaultTimezone)
          ? data.defaultTimezone
          : "America/New_York"
      );
    } catch {
      toast.error("Could not load preferences.");
    } finally {
      setWorkspaceLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadWorkspace();
  }, [loadWorkspace]);

  async function onSaveTimezone(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSavingTimezone(true);
    try {
      const res = await fetch("/api/workspace", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ defaultTimezone: timezone }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        toast.error(data.error ?? "Could not save timezone.");
        return;
      }
      toast.success("Default timezone saved.");
    } catch {
      toast.error("Could not reach the server.");
    } finally {
      setSavingTimezone(false);
    }
  }

  async function onChangePassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const currentPassword = String(fd.get("currentPassword") ?? "");
    const newPassword = String(fd.get("newPassword") ?? "");
    const confirm = String(fd.get("confirmPassword") ?? "");

    if (newPassword !== confirm) {
      toast.error("New password and confirmation do not match.");
      return;
    }

    setSavingPassword(true);
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
      setSavingPassword(false);
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
            Email, default timezone, and password.
          </p>
        </div>
      </div>

      <div className="space-y-6 rounded-xl border border-border bg-card/60 p-5">
        {/* Email */}
        <div className="space-y-2">
          <Label className="flex items-center gap-1.5 text-foreground">
            <Mail className="size-3.5 shrink-0 text-muted-foreground" />
            Email
          </Label>
          <Input
            readOnly
            value={email}
            disabled
            className="h-9 w-full font-mono text-[13px]"
          />
          <p className="text-[12px] leading-relaxed text-muted-foreground">
            Email cannot be changed from the app yet.
          </p>
        </div>

        <div className="h-px bg-border" />

        {/* Default timezone */}
        <div className="space-y-2">
          <Label className="flex items-center gap-1.5 text-foreground">
            <Globe className="size-3.5 shrink-0 text-muted-foreground" />
            Default timezone
          </Label>
          {workspaceLoading ? (
            <div className="flex items-center gap-2 py-2">
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
              <span className="text-[13px] text-muted-foreground">Loading…</span>
            </div>
          ) : (
            <form
              onSubmit={(e) => void onSaveTimezone(e)}
              className="space-y-3"
            >
              <Select
                value={timezone}
                onValueChange={(v) => setTimezone(v ?? "America/New_York")}
              >
                <SelectTrigger className="h-9 w-full bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COMMON_TIMEZONES.map((z) => (
                    <SelectItem key={z.value} value={z.value}>
                      {z.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[12px] leading-relaxed text-muted-foreground">
                Used as a default when scheduling; each campaign can still set
                its own timezone in the wizard.
              </p>
              <Button type="submit" size="sm" disabled={savingTimezone}>
                {savingTimezone ? "Saving…" : "Save timezone"}
              </Button>
            </form>
          )}
        </div>

        <div className="h-px bg-border" />

        {/* Password */}
        <form onSubmit={(e) => void onChangePassword(e)} className="space-y-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5 text-foreground">
              <Lock className="size-3.5 shrink-0 text-muted-foreground" />
              Password
            </Label>
            <p className="text-[12px] leading-relaxed text-muted-foreground">
              Change the password you use to sign in.
            </p>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cur-pw" className="text-muted-foreground">
                Current password
              </Label>
              <Input
                id="cur-pw"
                name="currentPassword"
                type="password"
                autoComplete="current-password"
                required
                className="h-9 w-full bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-pw" className="text-muted-foreground">
                New password
              </Label>
              <Input
                id="new-pw"
                name="newPassword"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                className="h-9 w-full bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="conf-pw" className="text-muted-foreground">
                Confirm new password
              </Label>
              <Input
                id="conf-pw"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                className="h-9 w-full bg-background"
              />
            </div>
          </div>
          <Button type="submit" size="sm" disabled={savingPassword}>
            {savingPassword ? "Saving…" : "Update password"}
          </Button>
        </form>
      </div>
    </section>
  );
}
