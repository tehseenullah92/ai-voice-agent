"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Phone, RefreshCw } from "lucide-react";

import { ListEmptyState } from "@/components/dashboard/list-empty-state";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TwilioIncomingEntry } from "@/lib/twilio-incoming";
import { cn } from "@/lib/utils";

export function PhoneNumbersManager() {
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [twilioConfigured, setTwilioConfigured] = useState(false);
  const [incoming, setIncoming] = useState<TwilioIncomingEntry[]>([]);
  const [defaultFrom, setDefaultFrom] = useState<string | null>(null);
  const [selected, setSelected] = useState<string>("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/workspace");
      const data = (await res.json()) as {
        twilioConfigured?: boolean;
        incomingPhoneNumbers?: TwilioIncomingEntry[];
        defaultFromNumber?: string | null;
      };
      setTwilioConfigured(Boolean(data.twilioConfigured));
      const list = Array.isArray(data.incomingPhoneNumbers)
        ? data.incomingPhoneNumbers
        : [];
      setIncoming(list);
      const def = data.defaultFromNumber ?? null;
      setDefaultFrom(def);
      setSelected(def ?? "");
    } catch {
      toast.error("Could not load phone numbers.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function onSync() {
    setSyncing(true);
    try {
      const res = await fetch("/api/twilio/sync-numbers", { method: "POST" });
      const data = (await res.json()) as {
        success?: boolean;
        error?: string;
        count?: number;
        defaultFromNumber?: string;
      };
      if (!res.ok) {
        toast.error(data.error ?? "Sync failed");
        return;
      }
      toast.success(
        data.count !== undefined
          ? `Synced ${data.count} number${data.count === 1 ? "" : "s"} from Twilio`
          : "Numbers synced from Twilio"
      );
      await load();
    } catch {
      toast.error("Could not reach the server.");
    } finally {
      setSyncing(false);
    }
  }

  async function onDefaultChange(value: string | null) {
    const next = String(value ?? "").trim();
    if (!next) return;
    setSelected(next);
    try {
      const res = await fetch("/api/workspace", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ defaultFromNumber: next }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        toast.error(data.error ?? "Could not update default");
        await load();
        return;
      }
      setDefaultFrom(next);
      toast.success("Default outbound number updated.");
    } catch {
      toast.error("Could not reach the server.");
      await load();
    }
  }

  const description = loading
    ? "Loading your workspace telephony status…"
    : !twilioConfigured
      ? "Connect your Twilio account to manage phone numbers and set your default outbound caller ID."
      : "Numbers on your Twilio account. The default is used for campaigns unless you pick a different caller ID when creating a campaign.";

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-sm font-medium text-muted-foreground">
          Phone numbers
        </h2>
        <p className="max-w-xl min-h-[2.75rem] text-[13px] leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>

      {loading ? (
        <div className="flex min-h-[180px] items-center justify-center rounded-xl border border-border bg-card/40 ring-1 ring-foreground/5">
          <Loader2
            className="size-7 animate-spin text-muted-foreground"
            aria-label="Loading phone numbers"
          />
        </div>
      ) : !twilioConfigured ? (
        <Card className="max-w-lg border-border bg-card">
          <CardHeader>
            <CardTitle className="text-[15px]">Twilio</CardTitle>
            <CardDescription>
              Connect your Twilio account in Settings to see incoming numbers and
              choose a default for outbound calls.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/dashboard/settings"
              className={buttonVariants({ variant: "secondary" })}
            >
              Go to Settings
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0 gap-2"
              disabled={syncing}
              onClick={() => void onSync()}
            >
              <RefreshCw
                className={cn("size-3.5", syncing && "animate-spin")}
              />
              {syncing ? "Syncing…" : "Sync from Twilio"}
            </Button>
          </div>

          {incoming.length === 0 ? (
            <ListEmptyState
              icon={Phone}
              title="No phone numbers synced"
              description="We did not find any numbers on your Twilio account yet. Sync from Twilio after purchasing numbers, or add them in the Twilio console first."
            >
              <Button
                type="button"
                variant="default"
                className="gap-2"
                disabled={syncing}
                onClick={() => void onSync()}
              >
                <RefreshCw
                  className={cn("size-3.5", syncing && "animate-spin")}
                />
                {syncing ? "Syncing…" : "Sync from Twilio"}
              </Button>
            </ListEmptyState>
          ) : (
            <Card className="max-w-lg border-border bg-card">
              <CardHeader>
                <CardTitle className="text-[15px]">Default caller ID</CardTitle>
                <CardDescription>
                  Outbound campaigns use this number when you do not override it in
                  the campaign.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="default-from">Phone number</Label>
                  <Select
                    value={selected || defaultFrom || ""}
                    onValueChange={(v) => void onDefaultChange(v)}
                  >
                    <SelectTrigger id="default-from" className="max-w-md">
                      <SelectValue placeholder="Select a number" />
                    </SelectTrigger>
                    <SelectContent>
                      {incoming.map((n) => (
                        <SelectItem key={n.sid || n.phoneNumber} value={n.phoneNumber}>
                          {n.friendlyName
                            ? `${n.friendlyName} · ${n.phoneNumber}`
                            : n.phoneNumber}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <ul className="space-y-2 text-[13px] text-muted-foreground">
                  {incoming.map((n) => (
                    <li
                      key={n.sid || n.phoneNumber}
                      className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border/80 py-2 last:border-0"
                    >
                      <span className="font-mono text-foreground">
                        {n.phoneNumber}
                      </span>
                      {n.friendlyName ? (
                        <span className="text-[12px]">{n.friendlyName}</span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
