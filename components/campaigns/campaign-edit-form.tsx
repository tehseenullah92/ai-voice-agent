"use client";

import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";

import type { TwilioIncomingEntry } from "@/lib/twilio-incoming";
import {
  StepAgent,
  StepBasics,
  StepSchedule,
  type TelephonyState,
} from "@/components/campaigns/campaign-wizard";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { campaignWizardReducer } from "@/lib/campaign-wizard-reducer";
import {
  initialCampaignWizardState,
  isoToDatetimeLocal,
  normalizeCampaignType,
  voiceIdFromStored,
  voiceLabelFromId,
  type CampaignWizardState,
} from "@/lib/campaign-wizard-types";

type ApiCampaignPayload = {
  name: string;
  type: string;
  description: string | null;
  agentName: string | null;
  agentVoice: string | null;
  openingLine: string | null;
  instructions: string | null;
  maxDuration: number;
  startAt: string | null;
  callHoursFrom: string | null;
  callHoursTo: string | null;
  timezone: string | null;
  callsPerHour: number;
  stopWhenAllReached: boolean;
  fromPhoneNumber: string | null;
};

function campaignToState(c: ApiCampaignPayload): CampaignWizardState {
  const empty = initialCampaignWizardState();
  return {
    ...empty,
    basics: {
      name: c.name,
      type: normalizeCampaignType(c.type),
      description: c.description ?? "",
      fromPhoneNumber: c.fromPhoneNumber ?? "",
    },
    agent: {
      name: c.agentName ?? "",
      voiceId: voiceIdFromStored(c.agentVoice),
      openingLine: c.openingLine ?? "",
      goal: c.instructions ?? "",
      maxDurationMinutes: c.maxDuration ?? 5,
    },
    schedule: {
      ...empty.schedule,
      startLocal: isoToDatetimeLocal(c.startAt),
      callingFrom: c.callHoursFrom ?? empty.schedule.callingFrom,
      callingTo: c.callHoursTo ?? empty.schedule.callingTo,
      timezone: c.timezone ?? empty.schedule.timezone,
      callsPerHour: c.callsPerHour ?? 60,
      stopWhenAllReached: c.stopWhenAllReached ?? true,
    },
  };
}

export function CampaignEditForm({ campaignId }: { campaignId: string }) {
  const router = useRouter();
  const [state, dispatch] = useReducer(
    campaignWizardReducer,
    initialCampaignWizardState()
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [telephony, setTelephony] = useState<TelephonyState>({
    loaded: false,
    twilioConfigured: false,
    incomingPhoneNumbers: [],
    defaultFromNumber: null,
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/workspace");
        const data = (await res.json()) as {
          twilioConfigured?: boolean;
          incomingPhoneNumbers?: TwilioIncomingEntry[];
          defaultFromNumber?: string | null;
        };
        if (cancelled) return;
        setTelephony({
          loaded: true,
          twilioConfigured: Boolean(data.twilioConfigured),
          incomingPhoneNumbers: Array.isArray(data.incomingPhoneNumbers)
            ? data.incomingPhoneNumbers
            : [],
          defaultFromNumber: data.defaultFromNumber ?? null,
        });
      } catch {
        if (!cancelled) {
          setTelephony((t) => ({ ...t, loaded: true }));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/campaigns/${campaignId}`);
        if (!res.ok) {
          toast.error("Campaign not found.");
          router.push("/dashboard/campaigns");
          return;
        }
        const data = (await res.json()) as { campaign: ApiCampaignPayload };
        if (cancelled) return;
        dispatch({ type: "HYDRATE", payload: campaignToState(data.campaign) });
      } catch {
        if (!cancelled) {
          toast.error("Could not load campaign.");
          router.push("/dashboard/campaigns");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [campaignId, router]);

  const canSave = useMemo(() => {
    return (
      state.basics.name.trim().length > 0 &&
      state.basics.type !== "" &&
      state.agent.name.trim().length > 0 &&
      state.agent.voiceId !== "" &&
      state.agent.openingLine.trim().length > 0 &&
      state.agent.goal.trim().length > 0
    );
  }, [state]);

  const save = useCallback(async () => {
    if (!canSave) return;
    setSaving(true);
    const payload = {
      name: state.basics.name.trim(),
      type: state.basics.type,
      description: state.basics.description.trim() || null,
      agentName: state.agent.name.trim(),
      agentVoice: voiceLabelFromId(state.agent.voiceId),
      openingLine: state.agent.openingLine.trim(),
      instructions: state.agent.goal.trim(),
      maxDuration: state.agent.maxDurationMinutes,
      startAt: new Date(state.schedule.startLocal).toISOString(),
      callHoursFrom: state.schedule.callingFrom,
      callHoursTo: state.schedule.callingTo,
      timezone: state.schedule.timezone,
      callsPerHour: state.schedule.callsPerHour,
      stopWhenAllReached: state.schedule.stopWhenAllReached,
      fromPhoneNumber: state.basics.fromPhoneNumber.trim() || null,
    };
    try {
      const res = await fetch(`/api/campaigns/${campaignId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await res.json()) as { error?: string };
      if (!res.ok) {
        toast.error(body.error ?? "Failed to save changes");
        return;
      }
      toast.success("Campaign updated.");
      router.push("/dashboard/campaigns");
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setSaving(false);
    }
  }, [campaignId, canSave, router, state]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="size-8 animate-spin" aria-label="Loading" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-16">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            href="/dashboard/campaigns"
            className="mb-3 inline-flex items-center gap-1 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            Back to campaigns
          </Link>
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Edit campaign
          </h2>
          <p className="mt-1 max-w-xl text-[13px] text-muted-foreground">
            Update name, agent, and schedule. Contact lists are unchanged; add
            contacts when creating a new campaign if needed.
          </p>
        </div>
      </div>

      <div className="space-y-8">
        <StepBasics state={state} dispatch={dispatch} telephony={telephony} />
        <StepAgent state={state} dispatch={dispatch} />
        <StepSchedule state={state} dispatch={dispatch} />
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-border pt-6">
        <Link
          href="/dashboard/campaigns"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Cancel
        </Link>
        <Button
          type="button"
          disabled={!canSave || saving}
          onClick={() => void save()}
          className="gap-1.5"
        >
          {saving ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Saving…
            </>
          ) : (
            "Save changes"
          )}
        </Button>
      </div>
    </div>
  );
}
