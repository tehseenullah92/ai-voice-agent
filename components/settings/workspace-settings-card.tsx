"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Building2, Loader2 } from "lucide-react";

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

export function WorkspaceSettingsCard() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [timezone, setTimezone] = useState("America/New_York");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/workspace");
      const data = (await res.json()) as {
        workspaceName?: string | null;
        defaultTimezone?: string | null;
        error?: string;
      };
      if (!res.ok) {
        toast.error(data.error ?? "Could not load workspace.");
        return;
      }
      setName(data.workspaceName ?? "");
      setTimezone(
        data.defaultTimezone && COMMON_TIMEZONES.some((z) => z.value === data.defaultTimezone)
          ? (data.defaultTimezone as string)
          : "America/New_York"
      );
    } catch {
      toast.error("Could not load workspace.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/workspace", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() === "" ? null : name.trim(),
          defaultTimezone: timezone,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        toast.error(data.error ?? "Could not save workspace.");
        return;
      }
      toast.success("Workspace settings saved.");
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
          <Building2 className="size-4 text-muted-foreground" strokeWidth={1.75} />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">Workspace</h3>
          <p className="text-[13px] text-muted-foreground">
            Display name and default timezone for scheduling.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card/60 p-5">
        {loading ? (
          <div className="flex items-center gap-2 py-4">
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
            <span className="text-[13px] text-muted-foreground">Loading…</span>
          </div>
        ) : (
          <form onSubmit={(e) => void onSubmit(e)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="ws-name">Workspace name</Label>
                <Input
                  id="ws-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Acme Outbound"
                  maxLength={191}
                  className="h-9 bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label>Default timezone</Label>
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
              </div>
            </div>
            <p className="text-[12px] text-muted-foreground">
              New campaigns still pick their own timezone in the wizard.
            </p>
            <Button type="submit" size="sm" disabled={saving}>
              {saving ? "Saving…" : "Save workspace"}
            </Button>
          </form>
        )}
      </div>
    </section>
  );
}
