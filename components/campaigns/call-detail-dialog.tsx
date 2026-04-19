"use client";

import { useEffect, useState } from "react";
import {
  Bot,
  Clock,
  Loader2,
  Mic,
  Phone,
  User,
  Volume2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type TranscriptEntry = {
  role: "user" | "agent";
  message: string;
  time_in_call_secs?: number;
};

type ConversationData = {
  conversation_id: string;
  status: string;
  has_audio: boolean;
  has_user_audio: boolean;
  has_response_audio: boolean;
  transcript: TranscriptEntry[];
  analysis?: {
    transcript_summary?: string;
    call_successful?: string;
    call_summary_title?: string;
    data_collection_results?: Record<
      string,
      { value: string; json_schema?: unknown }
    >;
  };
  metadata?: {
    call_duration_secs?: number;
    start_time_unix_secs?: number;
    cost?: number;
  };
};

type CallRow = {
  id: string;
  status: string;
  outcome: string | null;
  duration: number | null;
  elevenLabsConvId: string | null;
  twilioSid: string | null;
  createdAt: string;
  startedAt: string | null;
  endedAt: string | null;
  contact: { phone: string; data: unknown };
};

function formatSecs(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function CallDetailDialog({
  call,
  open,
  onOpenChange,
}: {
  call: CallRow | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [conv, setConv] = useState<ConversationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !call) {
      setConv(null);
      setError(null);
      setAudioUrl(null);
      return;
    }
    if (!call.elevenLabsConvId) {
      setError("No ElevenLabs conversation linked.");
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const res = await fetch(`/api/calls/${call.id}/conversation`);
        if (!res.ok) {
          const d = (await res.json()) as { error?: string };
          throw new Error(d.error ?? "Failed to load");
        }
        const data = (await res.json()) as ConversationData;
        if (!cancelled) {
          setConv(data);
          if (data.has_audio) {
            setAudioUrl(`/api/calls/${call.id}/audio`);
          }
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, call]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Phone className="size-4 text-muted-foreground" />
            Call to {call?.contact.phone ?? "—"}
          </DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {!loading && !error && conv && (
          <div className="flex flex-col gap-4 overflow-y-auto pr-1">
            {/* Summary strip */}
            <div className="flex flex-wrap gap-3">
              <MetaChip
                icon={<Clock className="size-3.5" />}
                label="Duration"
                value={
                  conv.metadata?.call_duration_secs != null
                    ? formatSecs(conv.metadata.call_duration_secs)
                    : call?.duration != null
                      ? formatSecs(call.duration)
                      : "—"
                }
              />
              <MetaChip
                icon={<Mic className="size-3.5" />}
                label="Status"
                value={conv.status}
              />
              {conv.analysis?.call_successful && (
                <MetaChip
                  icon={<Bot className="size-3.5" />}
                  label="Outcome"
                  value={conv.analysis.call_successful}
                />
              )}
              {conv.metadata?.cost != null && (
                <MetaChip
                  icon={<Volume2 className="size-3.5" />}
                  label="Cost"
                  value={`$${conv.metadata.cost.toFixed(4)}`}
                />
              )}
            </div>

            {/* Analysis summary */}
            {conv.analysis?.transcript_summary && (
              <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
                <p className="mb-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  AI Summary
                </p>
                <p className="text-sm leading-relaxed text-foreground/90">
                  {conv.analysis.transcript_summary}
                </p>
              </div>
            )}

            {/* Data collection results */}
            {conv.analysis?.data_collection_results &&
              Object.keys(conv.analysis.data_collection_results).length > 0 && (
                <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
                  <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Collected Data
                  </p>
                  <div className="space-y-1">
                    {Object.entries(conv.analysis.data_collection_results).map(
                      ([key, val]) => (
                        <div
                          key={key}
                          className="flex items-baseline gap-2 text-sm"
                        >
                          <span className="font-medium text-foreground/80">
                            {key}:
                          </span>
                          <span className="text-foreground/60">{val.value}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

            {/* Audio player */}
            {audioUrl && (
              <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
                <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Recording
                </p>
                <audio controls className="w-full" preload="none">
                  <source src={audioUrl} />
                  Your browser does not support audio playback.
                </audio>
              </div>
            )}

            {/* Transcript */}
            {conv.transcript.length > 0 && (
              <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
                <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Transcript
                </p>
                <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                  {conv.transcript
                    .filter((t) => t.message?.trim())
                    .map((t, i) => (
                      <div key={i} className="flex gap-2.5">
                        <div
                          className={cn(
                            "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full",
                            t.role === "agent"
                              ? "bg-primary/15 text-primary"
                              : "bg-foreground/10 text-foreground/60"
                          )}
                        >
                          {t.role === "agent" ? (
                            <Bot className="size-3.5" />
                          ) : (
                            <User className="size-3.5" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-foreground/70">
                              {t.role === "agent" ? "Agent" : "Contact"}
                            </span>
                            {t.time_in_call_secs != null && (
                              <span className="text-[11px] tabular-nums text-muted-foreground">
                                {formatSecs(t.time_in_call_secs)}
                              </span>
                            )}
                          </div>
                          <p className="text-sm leading-relaxed text-foreground/80">
                            {t.message}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {conv.transcript.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No transcript available for this call.
              </p>
            )}
          </div>
        )}

        {!loading && !error && !conv && call && !call.elevenLabsConvId && (
          <div className="py-8 text-center">
            <p className="text-sm text-muted-foreground">
              This call has no linked ElevenLabs conversation.
            </p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              Status: <span className="font-mono">{call.status}</span>
              {call.twilioSid && (
                <>
                  {" · "}
                  Twilio SID:{" "}
                  <span className="font-mono">{call.twilioSid}</span>
                </>
              )}
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function MetaChip({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2.5 py-1.5">
      <span className="text-muted-foreground">{icon}</span>
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <Badge variant="secondary" className="ml-0.5 text-xs font-normal">
        {value}
      </Badge>
    </div>
  );
}
