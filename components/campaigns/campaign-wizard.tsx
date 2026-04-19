"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  CirclePlay,
  Loader2,
  Upload,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import {
  campaignWizardReducer,
  type CampaignWizardAction,
} from "@/lib/campaign-wizard-reducer";
import {
  CAMPAIGN_TYPES,
  COMMON_TIMEZONES,
  VOICE_OPTIONS,
  initialCampaignWizardState,
  voiceLabelFromId,
  type CampaignType,
  type CampaignWizardState,
  type VoiceId,
} from "@/lib/campaign-wizard-types";
import { cn } from "@/lib/utils";
import type { TwilioIncomingEntry } from "@/lib/twilio-incoming";

export type TelephonyState = {
  loaded: boolean;
  twilioConfigured: boolean;
  incomingPhoneNumbers: TwilioIncomingEntry[];
  defaultFromNumber: string | null;
};

const STEP_LABELS = [
  "Basics",
  "Contacts",
  "AI Agent",
  "Schedule",
  "Review",
] as const;

function parseTimeToHours(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return (h ?? 0) + (m ?? 0) / 60;
}

function formatEstimatedDuration(
  contacts: number,
  callsPerHour: number,
  callingFrom: string,
  callingTo: string
) {
  if (contacts <= 0 || callsPerHour <= 0) return "—";

  const windowFrom = parseTimeToHours(callingFrom);
  const windowTo = parseTimeToHours(callingTo);
  const dailyHours = windowTo > windowFrom ? windowTo - windowFrom : 24;

  const dialingHours = Math.ceil(contacts / callsPerHour);

  if (dailyHours >= 24 || dialingHours <= dailyHours) {
    return `About ${dialingHours} hour${dialingHours === 1 ? "" : "s"}`;
  }

  const days = Math.ceil(dialingHours / dailyHours);
  const lastDayHours = dialingHours - (days - 1) * dailyHours;
  const roundedLastDay = Math.ceil(lastDayHours);

  if (days === 1) {
    return `About ${roundedLastDay} hour${roundedLastDay === 1 ? "" : "s"}`;
  }
  return `About ${days} day${days === 1 ? "" : "s"} (${Math.round(dailyHours)}h calling window/day)`;
}

export function CampaignWizard() {
  const router = useRouter();
  const [state, dispatch] = useReducer(
    campaignWizardReducer,
    initialCampaignWizardState()
  );
  const [step, setStep] = useState(0);
  const [slideDir, setSlideDir] = useState<"next" | "prev">("next");
  const [advanceAttemptStep, setAdvanceAttemptStep] = useState<number | null>(
    null
  );
  const [dragActive, setDragActive] = useState(false);
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

  const go = useCallback(
    (target: number, dir: "next" | "prev") => {
      setSlideDir(dir);
      setStep(target);
    },
    []
  );

  const canProceed = useMemo(() => {
    if (step === 0) {
      return (
        state.basics.name.trim().length > 0 && state.basics.type !== ""
      );
    }
    if (step === 1) {
      return (
        state.contacts.rows.length > 0 && state.contacts.phoneColumn !== null
      );
    }
    if (step === 2) {
      return (
        state.agent.name.trim().length > 0 &&
        state.agent.voiceId !== "" &&
        state.agent.openingLine.trim().length > 0 &&
        state.agent.goal.trim().length > 0
      );
    }
    return true;
  }, [step, state]);

  useEffect(() => {
    if (advanceAttemptStep === step && canProceed) {
      setAdvanceAttemptStep(null);
    }
  }, [advanceAttemptStep, step, canProceed]);

  const showStepErrors = advanceAttemptStep === step;

  const parseFile = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        const text = String(reader.result ?? "");
        Papa.parse<Record<string, string>>(text, {
          header: true,
          skipEmptyLines: "greedy",
          complete: (res) => {
            const fields = res.meta.fields?.filter(Boolean) as string[];
            const rows = (res.data as Record<string, string>[]).filter((row) =>
              Object.values(row).some((v) => String(v).trim() !== "")
            );
            if (!fields?.length || !rows.length) {
              toast.error("Could not read any rows from this CSV.");
              return;
            }
            (dispatch as React.Dispatch<CampaignWizardAction>)({
              type: "SET_CSV",
              payload: { headers: fields, rows, fileName: file.name },
            });
            toast.success("CSV loaded");
          },
          error: () => {
            toast.error("Failed to parse CSV.");
          },
        });
      };
      reader.readAsText(file);
    },
    [dispatch]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const f = e.dataTransfer.files[0];
      if (f) parseFile(f);
    },
    [parseFile]
  );

  const finish = useCallback(async () => {
    const phoneColumn = state.contacts.phoneColumn;
    if (!phoneColumn) {
      toast.error("Select a phone column before saving.");
      return;
    }

    const contacts = state.contacts.rows.map((row) => {
      const phone = String(row[phoneColumn] ?? "").trim();
      const data = Object.fromEntries(
        state.contacts.headers
          .filter((h) => h !== phoneColumn)
          .map((h) => [h, row[h] ?? ""])
      );
      return { phone, data };
    });

    const payload = {
      name: state.basics.name.trim(),
      type: state.basics.type,
      description: state.basics.description.trim() || null,
      status: "draft",
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
        fromPhoneNumber: state.basics.fromPhoneNumber.trim() || null,
      contacts,
    };

    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const body = (await res.json()) as { error?: string; id?: string };

      if (!res.ok) {
        toast.error(body.error ?? "Failed to save campaign");
        return;
      }

      if (!body.id) {
        toast.error("Invalid response from server");
        return;
      }

      toast.success("Campaign created. Start it from the campaign list when you are ready.");
      router.push("/dashboard/campaigns");
    } catch (e) {
      console.error(e);
      toast.error("Something went wrong.");
    }
  }, [router, state]);

  const previewRows = state.contacts.rows.slice(0, 5);
  const contactCount = state.contacts.rows.length;

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
            New campaign
          </h2>
          <p className="mt-1 max-w-xl text-[13px] text-muted-foreground">
            Configure your outbound campaign in a few steps. Saving persists to
            your workspace database.
          </p>
        </div>
      </div>

      {telephony.loaded && !telephony.twilioConfigured ? (
        <div className="flex gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-[13px] text-amber-200">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-400" />
          <div className="space-y-1">
            <p className="font-medium text-foreground">Twilio not connected</p>
            <p className="text-muted-foreground">
              You can save a draft, but launching calls requires a connected
              Twilio account and at least one phone number.{" "}
              <Link
                href="/dashboard/settings"
                className="font-medium text-primary hover:underline"
              >
                Open Settings
              </Link>
            </p>
          </div>
        </div>
      ) : null}

      <StepIndicator step={step} />

      <div
        className={cn(
          "transition-all duration-300 ease-out",
          slideDir === "next"
            ? "animate-in fade-in slide-in-from-right-2"
            : "animate-in fade-in slide-in-from-left-2"
        )}
        key={step}
      >
        {step === 0 ? (
          <StepBasics
            state={state}
            dispatch={dispatch}
            telephony={telephony}
            showStepErrors={showStepErrors}
          />
        ) : null}
        {step === 1 ? (
          <StepContacts
            state={state}
            dispatch={dispatch}
            dragActive={dragActive}
            setDragActive={setDragActive}
            onDrop={onDrop}
            parseFile={parseFile}
            previewRows={previewRows}
            contactCount={contactCount}
            showStepErrors={showStepErrors}
          />
        ) : null}
        {step === 2 ? (
          <StepAgent
            state={state}
            dispatch={dispatch}
            showStepErrors={showStepErrors}
          />
        ) : null}
        {step === 3 ? <StepSchedule state={state} dispatch={dispatch} /> : null}
        {step === 4 ? (
          <StepReview
            state={state}
            contactCount={contactCount}
            estimated={formatEstimatedDuration(
              contactCount,
              state.schedule.callsPerHour,
              state.schedule.callingFrom,
              state.schedule.callingTo
            )}
            onEditSection={(target) => go(target, "prev")}
            telephony={telephony}
          />
        ) : null}
      </div>

      <div className="flex items-center gap-4 border-t border-border pt-6">
        <div className="min-w-0 flex-1">
          {step > 0 ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setAdvanceAttemptStep(null);
                go(step - 1, "prev");
              }}
            >
              Back
            </Button>
          ) : null}
        </div>
        <div className="flex shrink-0 gap-2">
          {step < STEP_LABELS.length - 1 ? (
            <Button
              type="button"
              onClick={() => {
                if (!canProceed) {
                  setAdvanceAttemptStep(step);
                  return;
                }
                setAdvanceAttemptStep(null);
                go(step + 1, "next");
              }}
            >
              Continue
              <ArrowRight className="size-4" />
            </Button>
          ) : (
            <Button type="button" onClick={() => void finish()}>
              Create campaign
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function StepIndicator({ step }: { step: number }) {
  return (
    <nav aria-label="Progress" className="w-full">
      <ol className="flex items-center">
        {STEP_LABELS.map((label, i) => {
          const done = i < step;
          const active = i === step;
          const last = i === STEP_LABELS.length - 1;
          return (
            <li key={label} className="flex min-w-0 flex-1 items-center">
              {i > 0 ? (
                <div
                  className={cn(
                    "h-px flex-1",
                    step > i - 1 ? "bg-primary/50" : "bg-border"
                  )}
                  aria-hidden
                />
              ) : null}
              <div className="flex shrink-0 flex-col items-center gap-1.5 px-1">
                <div
                  className={cn(
                    "flex size-8 items-center justify-center rounded-full border text-xs font-medium transition-colors",
                    done &&
                      "border-primary bg-primary/15 text-primary",
                    active &&
                      "border-primary bg-primary text-primary-foreground",
                    !done &&
                      !active &&
                      "border-border bg-muted/40 text-muted-foreground"
                  )}
                >
                  {done ? <Check className="size-4" /> : i + 1}
                </div>
                <span
                  className={cn(
                    "max-w-[4.5rem] text-center text-[10px] font-medium leading-tight sm:max-w-none sm:text-[11px]",
                    active ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {label}
                </span>
              </div>
              {!last ? (
                <div
                  className={cn(
                    "h-px flex-1",
                    step > i ? "bg-primary/50" : "bg-border"
                  )}
                  aria-hidden
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function StepBasics({
  state,
  dispatch,
  telephony,
  showStepErrors = false,
}: {
  state: CampaignWizardState;
  dispatch: React.Dispatch<CampaignWizardAction>;
  telephony: TelephonyState;
  showStepErrors?: boolean;
}) {
  const multi =
    telephony.loaded &&
    telephony.twilioConfigured &&
    telephony.incomingPhoneNumbers.length > 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Campaign basics</CardTitle>
        <CardDescription>
          Name your campaign and choose what kind of calls you are running.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="camp-name">Campaign name</Label>
          <Input
            id="camp-name"
            placeholder="e.g. Solar leads — Texas Q2"
            value={state.basics.name}
            onChange={(e) =>
              dispatch({
                type: "SET_BASICS",
                payload: { name: e.target.value },
              })
            }
          />
          {showStepErrors && !state.basics.name.trim() ? (
            <p className="text-[12px] text-destructive">
              Enter a campaign name.
            </p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label>Campaign type</Label>
          <div className="grid gap-2 sm:grid-cols-2">
            {CAMPAIGN_TYPES.map((t) => {
              const selected = state.basics.type === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() =>
                    dispatch({
                      type: "SET_BASICS",
                      payload: { type: t as CampaignType },
                    })
                  }
                  className={cn(
                    "rounded-xl border px-3 py-3 text-left text-sm transition-all",
                    selected
                      ? "border-primary bg-primary/10 ring-1 ring-primary/40"
                      : "border-border bg-card hover:border-muted-foreground/30"
                  )}
                >
                  <span className="font-medium text-foreground">{t}</span>
                </button>
              );
            })}
          </div>
          {showStepErrors && !state.basics.type ? (
            <p className="text-[12px] text-destructive">
              Select a campaign type.
            </p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="camp-desc">Description (optional)</Label>
          <Textarea
            id="camp-desc"
            placeholder="Internal notes for your team…"
            value={state.basics.description}
            onChange={(e) =>
              dispatch({
                type: "SET_BASICS",
                payload: { description: e.target.value },
              })
            }
            className="min-h-[88px]"
          />
        </div>

        {multi ? (
          <div className="space-y-2">
            <Label htmlFor="caller-id">Outbound caller ID</Label>
            <p className="text-[12px] text-muted-foreground">
              Which Twilio number should appear as the caller for this
              campaign?
            </p>
            <Select
              value={
                state.basics.fromPhoneNumber.trim() === ""
                  ? "__default__"
                  : state.basics.fromPhoneNumber
              }
              onValueChange={(v) =>
                dispatch({
                  type: "SET_BASICS",
                  payload: {
                    fromPhoneNumber:
                      v === "__default__" ? "" : String(v ?? ""),
                  },
                })
              }
            >
              <SelectTrigger id="caller-id" className="w-full max-w-md">
                <SelectValue placeholder="Select a number" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__default__">
                  Workspace default (
                  {telephony.defaultFromNumber ?? "—"})
                </SelectItem>
                {telephony.incomingPhoneNumbers.map((n) => (
                  <SelectItem key={n.sid || n.phoneNumber} value={n.phoneNumber}>
                    {n.friendlyName
                      ? `${n.friendlyName} · ${n.phoneNumber}`
                      : n.phoneNumber}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function StepContacts({
  state,
  dispatch,
  dragActive,
  setDragActive,
  onDrop,
  parseFile,
  previewRows,
  contactCount,
  showStepErrors = false,
}: {
  state: CampaignWizardState;
  dispatch: React.Dispatch<CampaignWizardAction>;
  dragActive: boolean;
  setDragActive: (v: boolean) => void;
  onDrop: (e: React.DragEvent) => void;
  parseFile: (f: File) => void;
  previewRows: Record<string, string>[];
  contactCount: number;
  showStepErrors?: boolean;
}) {
  const headers = state.contacts.headers;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contacts</CardTitle>
        <CardDescription>
          Upload a CSV. We will detect columns and map the phone number field.
        </CardDescription>
        <p className="text-[12px] leading-relaxed text-muted-foreground">
          <a
            href="/sample-contacts.csv"
            download
            className="font-medium text-primary underline-offset-2 hover:underline"
          >
            Download sample CSV
          </a>{" "}
          (example columns: phone, name, company). Your file can use any
          headers — you will pick the phone column next.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div
          onDragEnter={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          className={cn(
            "relative flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-6 py-12 transition-colors",
            dragActive
              ? "border-primary bg-primary/5"
              : "border-border bg-muted/20 hover:border-muted-foreground/40"
          )}
        >
          <input
            type="file"
            accept=".csv,text/csv"
            aria-label="Upload CSV file"
            className="absolute inset-0 cursor-pointer opacity-0"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) parseFile(f);
            }}
          />
          <Upload className="mb-2 size-8 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">
            Drag and drop a CSV here
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            or click to browse — must include a header row
          </p>
          {state.contacts.fileName ? (
            <p className="mt-3 text-xs text-primary">
              Loaded: {state.contacts.fileName}
            </p>
          ) : null}
          {showStepErrors && headers.length === 0 ? (
            <p className="mt-3 text-center text-[12px] text-destructive">
              Upload a CSV with a header row and at least one contact row.
            </p>
          ) : null}
        </div>

        {headers.length > 0 ? (
          <>
            <div className="space-y-2">
              <Label>Preview (first 5 rows)</Label>
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full min-w-[320px] text-left text-xs">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      {headers.map((h) => (
                        <th
                          key={h}
                          className="px-2 py-2 font-medium text-muted-foreground"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewRows.map((row, ri) => (
                      <tr key={ri} className="border-b border-border/80">
                        {headers.map((h) => (
                          <td key={h} className="px-2 py-1.5 text-foreground">
                            {row[h] ?? ""}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone-col">Which column is the phone number?</Label>
              <Select
                value={state.contacts.phoneColumn ?? undefined}
                onValueChange={(v) =>
                  dispatch({ type: "SET_PHONE_COLUMN", payload: v })
                }
              >
                <SelectTrigger id="phone-col" className="w-full max-w-md">
                  <SelectValue placeholder="Select a column" />
                </SelectTrigger>
                <SelectContent>
                  {headers.map((h) => (
                    <SelectItem key={h} value={h}>
                      {h}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {state.contacts.phoneColumn ? (
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {contactCount}
                  </span>{" "}
                  contacts loaded
                </p>
              ) : null}
              {showStepErrors &&
              headers.length > 0 &&
              !state.contacts.phoneColumn ? (
                <p className="text-[12px] text-destructive">
                  Select which column contains phone numbers.
                </p>
              ) : null}
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function StepAgent({
  state,
  dispatch,
  showStepErrors = false,
}: {
  state: CampaignWizardState;
  dispatch: React.Dispatch<CampaignWizardAction>;
  showStepErrors?: boolean;
}) {
  const [previewLoadingVoiceId, setPreviewLoadingVoiceId] = useState<
    VoiceId | ""
  >("");
  const previewUrlRef = useRef<string | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const previewAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      previewAbortRef.current?.abort();
      previewAudioRef.current?.pause();
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  const playVoiceSample = useCallback(async (voiceId: VoiceId) => {
    previewAbortRef.current?.abort();
    previewAudioRef.current?.pause();
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }

    const ac = new AbortController();
    previewAbortRef.current = ac;

    try {
      setPreviewLoadingVoiceId(voiceId);
      const res = await fetch(
        `/api/elevenlabs/voice-preview?voiceId=${encodeURIComponent(voiceId)}`,
        { signal: ac.signal }
      );
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        toast.error(j.error ?? "Could not load voice preview.");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      previewUrlRef.current = url;
      const audio = new Audio(url);
      previewAudioRef.current = audio;
      await audio.play();
    } catch (e) {
      if (ac.signal.aborted) return;
      const err = e as { name?: string };
      if (err?.name === "AbortError") return;
      toast.error("Could not play preview.");
    } finally {
      if (!ac.signal.aborted) {
        setPreviewLoadingVoiceId("");
      }
    }
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI agent</CardTitle>
        <CardDescription>
          Configure how your voice agent sounds and what it should accomplish.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="agent-name">Agent name</Label>
          <Input
            id="agent-name"
            placeholder="e.g. Alex"
            value={state.agent.name}
            onChange={(e) =>
              dispatch({
                type: "SET_AGENT",
                payload: { name: e.target.value },
              })
            }
          />
          {showStepErrors && !state.agent.name.trim() ? (
            <p className="text-[12px] text-destructive">Enter an agent name.</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label>Voice</Label>
          <div className="grid gap-2 sm:grid-cols-2">
            {VOICE_OPTIONS.map((v) => {
              const selected = state.agent.voiceId === v.id;
              const loadingPreview = previewLoadingVoiceId === v.id;
              return (
                <div
                  key={v.id}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border px-3 py-3 transition-all",
                    selected
                      ? "border-primary bg-primary/10 ring-1 ring-primary/40"
                      : "border-border bg-card"
                  )}
                >
                  <button
                    type="button"
                    aria-label={`Select ${v.label}`}
                    onClick={() =>
                      dispatch({
                        type: "SET_AGENT",
                        payload: { voiceId: v.id as VoiceId },
                      })
                    }
                    className="min-w-0 flex-1 text-left"
                  >
                    <span className="block text-sm font-medium text-foreground">
                      {v.label}
                    </span>
                  </button>
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="outline"
                    className="shrink-0"
                    disabled={loadingPreview}
                    aria-label={`Play sample for ${v.label}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      void playVoiceSample(v.id);
                    }}
                  >
                    {loadingPreview ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <CirclePlay className="size-4" />
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
          {showStepErrors && !state.agent.voiceId ? (
            <p className="text-[12px] text-destructive">Select a voice.</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="opening">Opening line</Label>
          <Textarea
            id="opening"
            placeholder="Hi, this is Alex from Acme calling about…"
            value={state.agent.openingLine}
            onChange={(e) =>
              dispatch({
                type: "SET_AGENT",
                payload: { openingLine: e.target.value },
              })
            }
          />
          {showStepErrors && !state.agent.openingLine.trim() ? (
            <p className="text-[12px] text-destructive">
              Enter an opening line for the agent.
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="goal">Goal / instructions</Label>
          <Textarea
            id="goal"
            placeholder="What should the agent achieve on each call?"
            value={state.agent.goal}
            onChange={(e) =>
              dispatch({
                type: "SET_AGENT",
                payload: { goal: e.target.value },
              })
            }
            className="min-h-[100px]"
          />
          {showStepErrors && !state.agent.goal.trim() ? (
            <p className="text-[12px] text-destructive">
              Describe what the agent should accomplish on each call.
            </p>
          ) : null}
          <p className="text-[12px] leading-relaxed text-muted-foreground">
            Be specific. &quot;Qualify leads for solar panels in Texas&quot;
            works better than &quot;sell our product&quot;.
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4">
            <Label>Max call duration</Label>
            <span className="text-sm tabular-nums text-muted-foreground">
              {state.agent.maxDurationMinutes} min
            </span>
          </div>
          <Slider
            min={1}
            max={10}
            step={1}
            value={[state.agent.maxDurationMinutes]}
            onValueChange={(vals) => {
              const v = Array.isArray(vals) ? vals[0] : vals;
              if (typeof v === "number") {
                dispatch({
                  type: "SET_AGENT",
                  payload: { maxDurationMinutes: v },
                });
              }
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export function StepSchedule({
  state,
  dispatch,
}: {
  state: CampaignWizardState;
  dispatch: React.Dispatch<CampaignWizardAction>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Schedule</CardTitle>
        <CardDescription>
          When calls may start and how fast to dial through your list.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="start-dt">Start date &amp; time</Label>
          <Input
            id="start-dt"
            type="datetime-local"
            value={state.schedule.startLocal}
            onChange={(e) =>
              dispatch({
                type: "SET_SCHEDULE",
                payload: { startLocal: e.target.value },
              })
            }
            className="max-w-md"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="from">Calling hours from</Label>
            <Input
              id="from"
              type="time"
              value={state.schedule.callingFrom}
              onChange={(e) =>
                dispatch({
                  type: "SET_SCHEDULE",
                  payload: { callingFrom: e.target.value },
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="to">Calling hours to</Label>
            <Input
              id="to"
              type="time"
              value={state.schedule.callingTo}
              onChange={(e) =>
                dispatch({
                  type: "SET_SCHEDULE",
                  payload: { callingTo: e.target.value },
                })
              }
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Timezone</Label>
          <Select
            value={state.schedule.timezone}
            onValueChange={(v) => {
              if (v)
                dispatch({
                  type: "SET_SCHEDULE",
                  payload: { timezone: v },
                });
            }}
          >
            <SelectTrigger className="w-full max-w-md">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COMMON_TIMEZONES.map((tz) => (
                <SelectItem key={tz.value} value={tz.value}>
                  {tz.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4">
            <Label>Calls per hour limit</Label>
            <span className="text-sm tabular-nums text-muted-foreground">
              {state.schedule.callsPerHour}
            </span>
          </div>
          <Slider
            min={10}
            max={500}
            step={10}
            value={[state.schedule.callsPerHour]}
            onValueChange={(vals) => {
              const v = Array.isArray(vals) ? vals[0] : vals;
              if (typeof v === "number") {
                dispatch({
                  type: "SET_SCHEDULE",
                  payload: { callsPerHour: v },
                });
              }
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function ReviewSection({
  title,
  stepIndex,
  onEditSection,
  children,
}: {
  title: string;
  stepIndex: number;
  onEditSection: (stepIndex: number) => void;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card/60 px-4 py-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-medium text-foreground">{title}</h3>
        <button
          type="button"
          onClick={() => onEditSection(stepIndex)}
          className="text-[13px] font-medium text-primary hover:underline"
        >
          Edit
        </button>
      </div>
      <div className="space-y-1 text-[13px] text-muted-foreground">{children}</div>
    </div>
  );
}

function StepReview({
  state,
  contactCount,
  estimated,
  onEditSection,
  telephony,
}: {
  state: CampaignWizardState;
  contactCount: number;
  estimated: string;
  onEditSection: (stepIndex: number) => void;
  telephony: TelephonyState;
}) {
  const tzLabel =
    COMMON_TIMEZONES.find((z) => z.value === state.schedule.timezone)?.label ??
    state.schedule.timezone;

  const callerSummary = (() => {
    if (!telephony.twilioConfigured) return "Twilio not connected";
    const explicit = state.basics.fromPhoneNumber.trim();
    if (explicit) return explicit;
    if (telephony.defaultFromNumber) {
      return `Workspace default (${telephony.defaultFromNumber})`;
    }
    return "—";
  })();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Review &amp; create</CardTitle>
        <CardDescription>
          Confirm everything looks right. The campaign is saved as a draft; start
          dialing from the campaign list when you are ready.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ReviewSection title="Basics" stepIndex={0} onEditSection={onEditSection}>
          <p>
            <span className="text-foreground">{state.basics.name || "—"}</span>{" "}
            · {state.basics.type || "—"}
          </p>
          {state.basics.description ? (
            <p className="whitespace-pre-wrap">{state.basics.description}</p>
          ) : (
            <p className="italic">No description</p>
          )}
          {telephony.loaded && telephony.twilioConfigured ? (
            <p className="pt-1">
              <span className="text-foreground">Caller ID:</span>{" "}
              {callerSummary}
            </p>
          ) : null}
        </ReviewSection>

        <ReviewSection title="Contacts" stepIndex={1} onEditSection={onEditSection}>
          <p>
            {contactCount} contacts
            {state.contacts.phoneColumn
              ? ` · Phone column: ${state.contacts.phoneColumn}`
              : ""}
          </p>
          {state.contacts.fileName ? (
            <p>File: {state.contacts.fileName}</p>
          ) : null}
        </ReviewSection>

        <ReviewSection title="AI agent" stepIndex={2} onEditSection={onEditSection}>
          <p>
            {state.agent.name} ·{" "}
            {VOICE_OPTIONS.find((v) => v.id === state.agent.voiceId)?.label ??
              "—"}
          </p>
          <p className="text-foreground">Opens with: {state.agent.openingLine}</p>
          <p className="whitespace-pre-wrap">{state.agent.goal}</p>
          <p>Max duration: {state.agent.maxDurationMinutes} min</p>
        </ReviewSection>

        <ReviewSection title="Schedule" stepIndex={3} onEditSection={onEditSection}>
          <p>Starts: {state.schedule.startLocal.replace("T", " ")}</p>
          <p>
            Calling hours: {state.schedule.callingFrom}–{state.schedule.callingTo}{" "}
            ({tzLabel})
          </p>
          <p>Calls per hour: {state.schedule.callsPerHour}</p>
        </ReviewSection>

        <div className="rounded-xl border border-primary/30 bg-primary/5 px-4 py-3">
          <p className="text-sm font-medium text-foreground">
            Estimated duration
          </p>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Based on {contactCount} contacts at {state.schedule.callsPerHour}{" "}
            calls/hour: <span className="text-foreground">{estimated}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
