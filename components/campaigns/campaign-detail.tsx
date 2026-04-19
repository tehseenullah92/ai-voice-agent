"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  Clock,
  ExternalLink,
  Headphones,
  Loader2,
  Megaphone,
  Phone,
  PhoneCall,
  PhoneOff,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CallDetailDialog } from "@/components/campaigns/call-detail-dialog";
import { ListEmptyState } from "@/components/dashboard/list-empty-state";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type Campaign = {
  id: string;
  name: string;
  type: string;
  status: string;
  description: string | null;
  agentName: string | null;
  agentVoice: string | null;
  openingLine: string | null;
  fromPhoneNumber: string | null;
  elevenLabsAgentId: string | null;
  createdAt: string;
  _count: { contacts: number; calls: number };
};

type CallStats = Record<string, number>;

type CallRow = {
  id: string;
  status: string;
  outcome: string | null;
  duration: number | null;
  elevenLabsConvId: string | null;
  twilioSid: string | null;
  transcript: unknown;
  createdAt: string;
  startedAt: string | null;
  endedAt: string | null;
  contact: { phone: string; data: unknown };
};

type StatusKey = "Active" | "Draft" | "Completed" | "Paused";

function formatStatus(s: string): StatusKey {
  const l = s.toLowerCase();
  if (l === "active") return "Active";
  if (l === "completed") return "Completed";
  if (l === "paused") return "Paused";
  return "Draft";
}

function formatDuration(secs: number | null): string {
  if (secs == null) return "—";
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function callStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case "completed":
      return "border-emerald-500/30 bg-emerald-500/15 text-emerald-400";
    case "in_progress":
    case "in-progress":
      return "border-blue-500/30 bg-blue-500/15 text-blue-400";
    case "initiated":
    case "queued":
      return "border-amber-500/30 bg-amber-500/15 text-amber-400";
    case "failed":
      return "border-red-500/30 bg-red-500/15 text-red-400";
    default:
      return "border-border bg-muted text-muted-foreground";
  }
}

function campaignStatusColor(status: StatusKey): string {
  switch (status) {
    case "Active":
      return "border-emerald-500/30 bg-emerald-500/15 text-emerald-400";
    case "Completed":
      return "border-blue-500/30 bg-blue-500/15 text-blue-400";
    case "Paused":
      return "border-amber-500/30 bg-amber-500/15 text-amber-400";
    default:
      return "border-border bg-muted text-muted-foreground";
  }
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function CampaignDetail({ campaignId }: { campaignId: string }) {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [callStats, setCallStats] = useState<CallStats>({});
  const [calls, setCalls] = useState<CallRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [callsLoading, setCallsLoading] = useState(true);
  const [selectedCall, setSelectedCall] = useState<CallRow | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [campRes, callsRes] = await Promise.all([
          fetch(`/api/campaigns/${campaignId}`),
          fetch(`/api/campaigns/${campaignId}/calls`),
        ]);

        if (!campRes.ok) throw new Error("Failed to load campaign");
        const campData = (await campRes.json()) as {
          campaign: Campaign;
          callStats: CallStats;
        };
        if (!cancelled) {
          setCampaign(campData.campaign);
          setCallStats(campData.callStats);
          setLoading(false);
        }

        if (!callsRes.ok) throw new Error("Failed to load calls");
        const callsData = (await callsRes.json()) as CallRow[];
        if (!cancelled) {
          setCalls(callsData);
          setCallsLoading(false);
        }
      } catch {
        if (!cancelled) {
          toast.error("Could not load campaign details.");
          setLoading(false);
          setCallsLoading(false);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [campaignId]);

  function openCallDetail(call: CallRow) {
    setSelectedCall(call);
    setDialogOpen(true);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="space-y-4 py-12 text-center">
        <p className="text-sm text-muted-foreground">Campaign not found.</p>
        <Link
          href="/dashboard/campaigns"
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          Back to campaigns
        </Link>
      </div>
    );
  }

  const status = formatStatus(campaign.status);
  const totalCalls = Object.values(callStats).reduce((a, b) => a + b, 0);
  const completed = callStats["completed"] ?? 0;
  const failed = callStats["failed"] ?? 0;
  const inProgress =
    (callStats["initiated"] ?? 0) + (callStats["in_progress"] ?? 0);
  const queued = callStats["queued"] ?? 0;

  return (
    <div className="space-y-6">
      {/* Back link + title */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <Link
            href="/dashboard/campaigns"
            className="mb-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-3" />
            All campaigns
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-foreground">
              {campaign.name}
            </h1>
            <Badge
              variant="secondary"
              className={cn("font-normal", campaignStatusColor(status))}
            >
              {status}
            </Badge>
          </div>
          {campaign.description && (
            <p className="max-w-xl text-sm text-muted-foreground">
              {campaign.description}
            </p>
          )}
        </div>
        <Link
          href={`/dashboard/campaigns/${campaignId}/edit`}
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          Edit
        </Link>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        <StatCard
          icon={<Users className="size-4" />}
          label="Contacts"
          value={campaign._count.contacts}
        />
        <StatCard
          icon={<PhoneCall className="size-4" />}
          label="Total Calls"
          value={totalCalls}
        />
        <StatCard
          icon={<Phone className="size-4" />}
          label="Completed"
          value={completed}
          color="text-emerald-400"
        />
        <StatCard
          icon={<PhoneOff className="size-4" />}
          label="Failed"
          value={failed}
          color="text-red-400"
        />
        <StatCard
          icon={<Megaphone className="size-4" />}
          label="In Progress"
          value={inProgress}
          color="text-blue-400"
        />
        <StatCard
          icon={<Clock className="size-4" />}
          label="Queued"
          value={queued}
          color="text-amber-400"
        />
      </div>

      {/* Agent info strip */}
      {campaign.elevenLabsAgentId && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg border border-border bg-card/40 px-4 py-2.5 text-xs text-muted-foreground">
          <span>
            Agent: <span className="text-foreground">{campaign.agentName ?? campaign.name}</span>
          </span>
          {campaign.agentVoice && (
            <span>
              Voice: <span className="text-foreground">{campaign.agentVoice}</span>
            </span>
          )}
          {campaign.fromPhoneNumber && (
            <span>
              From: <span className="font-mono text-foreground">{campaign.fromPhoneNumber}</span>
            </span>
          )}
          <span className="font-mono text-[11px] text-muted-foreground/60">
            {campaign.elevenLabsAgentId}
          </span>
        </div>
      )}

      {/* Call logs */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-foreground">Call Logs</h2>
          <Button
            variant="ghost"
            size="sm"
            disabled={callsLoading}
            onClick={async () => {
              setCallsLoading(true);
              try {
                const res = await fetch(
                  `/api/campaigns/${campaignId}/calls`
                );
                if (res.ok) {
                  setCalls((await res.json()) as CallRow[]);
                }
              } finally {
                setCallsLoading(false);
              }
            }}
          >
            {callsLoading ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              "Refresh"
            )}
          </Button>
        </div>

        {callsLoading && calls.length === 0 ? (
          <div className="flex items-center justify-center rounded-xl border border-border bg-card/40 py-16">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : calls.length === 0 ? (
          <ListEmptyState
            icon={PhoneCall}
            title="No calls yet"
            description="When this campaign dials contacts, each attempt will show up here with status, duration, and playback when available."
          >
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={callsLoading}
              className="gap-2"
              onClick={async () => {
                setCallsLoading(true);
                try {
                  const res = await fetch(
                    `/api/campaigns/${campaignId}/calls`
                  );
                  if (res.ok) {
                    setCalls((await res.json()) as CallRow[]);
                  }
                } finally {
                  setCallsLoading(false);
                }
              }}
            >
              {callsLoading ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : null}
              Refresh
            </Button>
          </ListEmptyState>
        ) : (
          <div className="rounded-xl border border-border bg-card/40 ring-1 ring-foreground/5">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Outcome</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Started</TableHead>
                  <TableHead className="w-[100px] text-right">
                    Details
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {calls.map((call) => (
                  <TableRow
                    key={call.id}
                    className="cursor-pointer"
                    onClick={() => openCallDetail(call)}
                  >
                    <TableCell className="font-mono text-sm text-foreground">
                      {call.contact.phone}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "font-normal text-xs",
                          callStatusColor(call.status)
                        )}
                      >
                        {call.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {call.outcome ?? "—"}
                    </TableCell>
                    <TableCell className="tabular-nums text-sm text-muted-foreground">
                      {formatDuration(call.duration)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {call.startedAt
                        ? new Date(call.startedAt).toLocaleString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {call.elevenLabsConvId ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            openCallDetail(call);
                          }}
                        >
                          <Headphones className="mr-1 size-3.5" />
                          View
                        </Button>
                      ) : call.twilioSid ? (
                        <span className="text-xs text-muted-foreground/50">
                          <ExternalLink className="inline size-3" /> Twilio
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground/40">
                          —
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <CallDetailDialog
        call={selectedCall}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Stat Card                                                          */
/* ------------------------------------------------------------------ */

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card/40 px-3.5 py-3">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="text-[11px] font-medium uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p
        className={cn(
          "mt-1 text-xl font-semibold tabular-nums",
          color ?? "text-foreground"
        )}
      >
        {value.toLocaleString()}
      </p>
    </div>
  );
}
