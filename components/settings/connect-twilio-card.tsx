"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Loader2, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { TwilioIncomingEntry } from "@/lib/twilio-incoming";
import { cn } from "@/lib/utils";

type WorkspaceTelephony = {
  twilioConfigured: boolean;
  accountSid: string | null;
  defaultFromNumber: string | null;
  incomingPhoneNumbers: TwilioIncomingEntry[];
};

export function ConnectTwilioCard() {
  const [loading, setLoading] = useState(false);
  const [bootLoading, setBootLoading] = useState(true);
  const [telephony, setTelephony] = useState<WorkspaceTelephony | null>(null);
  const [disconnecting, setDisconnecting] = useState(false);
  const [disconnectOpen, setDisconnectOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/workspace");
      const data = (await res.json()) as {
        twilioConfigured?: boolean;
        accountSid?: string | null;
        defaultFromNumber?: string | null;
        incomingPhoneNumbers?: TwilioIncomingEntry[];
      };
      setTelephony({
        twilioConfigured: Boolean(data.twilioConfigured),
        accountSid: data.accountSid ?? null,
        defaultFromNumber: data.defaultFromNumber ?? null,
        incomingPhoneNumbers: Array.isArray(data.incomingPhoneNumbers)
          ? data.incomingPhoneNumbers
          : [],
      });
    } catch {
      toast.error("Could not load Twilio status.");
      setTelephony({
        twilioConfigured: false,
        accountSid: null,
        defaultFromNumber: null,
        incomingPhoneNumbers: [],
      });
    } finally {
      setBootLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const accountSid = String(fd.get("accountSid") ?? "").trim();
    const authToken = String(fd.get("authToken") ?? "").trim();

    if (!accountSid || !authToken) {
      toast.error("Enter your Account SID and Auth Token.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/twilio/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountSid, authToken }),
      });
      const data = (await res.json()) as {
        success?: boolean;
        phoneNumber?: string;
        count?: number;
        error?: string;
      };

      if (!res.ok) {
        toast.error(data.error ?? "Invalid credentials");
        return;
      }

      const suffix =
        typeof data.count === "number" && data.count > 1
          ? ` (${data.count} numbers)`
          : data.phoneNumber
            ? ` — ${data.phoneNumber}`
            : "";
      toast.success(`Twilio connected${suffix}`);
      form.reset();
      await load();
    } catch (err) {
      console.error(err);
      toast.error("Could not reach the server.");
    } finally {
      setLoading(false);
    }
  }

  async function confirmDisconnect() {
    setDisconnecting(true);
    try {
      const res = await fetch("/api/twilio/disconnect", { method: "POST" });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        toast.error(data.error ?? "Could not disconnect");
        return;
      }
      toast.success("Twilio disconnected.");
      setDisconnectOpen(false);
      await load();
    } catch {
      toast.error("Could not reach the server.");
    } finally {
      setDisconnecting(false);
    }
  }

  const connected = telephony?.twilioConfigured ?? false;
  const numberCount = telephony?.incomingPhoneNumbers.length ?? 0;

  return (
    <section className="space-y-6">
      <ConfirmDialog
        open={disconnectOpen}
        onOpenChange={setDisconnectOpen}
        title="Disconnect Twilio?"
        description="Outbound calls will stop until you connect again. Existing campaign drafts stay in your workspace."
        confirmLabel="Disconnect"
        confirmVariant="destructive"
        pending={disconnecting}
        onConfirm={() => void confirmDisconnect()}
      />

      <div className="flex items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-card">
          <Phone className="size-4 text-muted-foreground" strokeWidth={1.75} />
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">Telephony</h3>
            {connected && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium",
                  "border-emerald-500/35 bg-emerald-500/10 text-emerald-400"
                )}
              >
                <CheckCircle2 className="size-3" aria-hidden />
                Connected
              </span>
            )}
          </div>
          <p className="text-[13px] text-muted-foreground">
            {connected
              ? "Your Twilio account is linked to this workspace."
              : "Connect Twilio to place and receive AI calls."}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card/60 p-5">
        {bootLoading ? (
          <div className="flex items-center gap-2 py-4">
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
            <span className="text-[13px] text-muted-foreground">
              Loading Twilio status…
            </span>
          </div>
        ) : connected ? (
          <div className="space-y-5">
            <div className="flex items-start gap-4">
              <div
                className="flex size-10 shrink-0 items-center justify-center rounded-md border border-border bg-background"
                aria-hidden
              >
                <span className="text-[10px] font-bold tracking-tight text-[#f22f46]">
                  twilio
                </span>
              </div>
              <div className="min-w-0 flex-1 space-y-3">
                <dl className="grid gap-x-8 gap-y-2 text-[13px] sm:grid-cols-3">
                  <div>
                    <dt className="text-[12px] text-muted-foreground">Account SID</dt>
                    <dd className="mt-0.5 font-mono text-[12px] text-foreground break-all">
                      {telephony?.accountSid ?? "\u2014"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[12px] text-muted-foreground">Default caller ID</dt>
                    <dd className="mt-0.5 font-mono text-[12px] text-foreground">
                      {telephony?.defaultFromNumber ?? "\u2014"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[12px] text-muted-foreground">Numbers on file</dt>
                    <dd className="mt-0.5 tabular-nums text-foreground">
                      {numberCount}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
            <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-muted/10 px-4 py-3">
              <p className="text-[12px] text-muted-foreground">
                To use a different Twilio account, disconnect first, then connect
                again with new credentials.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0 border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                disabled={disconnecting}
                onClick={() => setDisconnectOpen(true)}
              >
                {disconnecting ? "Disconnecting…" : "Disconnect"}
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={(e) => void onSubmit(e)} className="space-y-4">
            <div className="flex items-start gap-4">
              <div
                className="flex size-10 shrink-0 items-center justify-center rounded-md border border-border bg-background"
                aria-hidden
              >
                <span className="text-[10px] font-bold tracking-tight text-[#f22f46]">
                  twilio
                </span>
              </div>
              <p className="text-[13px] leading-relaxed text-muted-foreground pt-2">
                Link your Twilio account so Convaire can place and receive calls
                on your numbers.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="twilio-sid">Account SID</Label>
                <Input
                  id="twilio-sid"
                  name="accountSid"
                  type="text"
                  autoComplete="off"
                  placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="h-9 font-mono text-[13px] bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="twilio-token">Auth Token</Label>
                <Input
                  id="twilio-token"
                  name="authToken"
                  type="password"
                  autoComplete="off"
                  placeholder="Your auth token"
                  className="h-9 font-mono text-[13px] bg-background"
                />
              </div>
            </div>
            <Button type="submit" size="sm" disabled={loading}>
              {loading ? "Connecting…" : "Connect Twilio"}
            </Button>
          </form>
        )}
      </div>
    </section>
  );
}
