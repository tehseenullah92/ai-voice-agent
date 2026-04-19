"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Briefcase,
  Calendar,
  ClipboardList,
  Megaphone,
  MoreHorizontal,
  Pencil,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  UserSearch,
  Eye,
  Play,
  type LucideIcon,
} from "lucide-react";

import { ListEmptyState } from "@/components/dashboard/list-empty-state";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

type RowStatus = "Active" | "Draft" | "Completed" | "Paused";

type CampaignRow = {
  id: string;
  name: string;
  type: string;
  status: RowStatus;
  contacts: number;
  created: string;
};

function statusFromApi(s: string): RowStatus {
  const lower = s.toLowerCase();
  if (lower === "active") return "Active";
  if (lower === "completed") return "Completed";
  if (lower === "paused") return "Paused";
  return "Draft";
}

type ApiCampaign = {
  id: string;
  name: string;
  type: string;
  status: string;
  createdAt: string;
  _count: { contacts: number };
};

function mapCampaign(c: ApiCampaign): CampaignRow {
  return {
    id: c.id,
    name: c.name,
    type: c.type,
    status: statusFromApi(c.status),
    contacts: c._count.contacts,
    created: c.createdAt.slice(0, 10),
  };
}

function typePresentation(type: string): {
  Icon: LucideIcon;
  iconClass: string;
} {
  switch (type) {
    case "Outbound Sales":
      return { Icon: Briefcase, iconClass: "text-sky-400" };
    case "Appointment Reminder":
      return { Icon: Calendar, iconClass: "text-violet-400" };
    case "Survey / Feedback":
      return { Icon: ClipboardList, iconClass: "text-amber-400" };
    case "Hiring Screen":
      return { Icon: UserSearch, iconClass: "text-emerald-400" };
    case "Custom":
      return { Icon: Sparkles, iconClass: "text-rose-400" };
    default:
      return { Icon: Megaphone, iconClass: "text-muted-foreground" };
  }
}

function TypeCell({ type }: { type: string }) {
  const { Icon, iconClass } = typePresentation(type);
  return (
    <div className="flex min-w-0 items-center gap-2">
      <Icon className={cn("size-4 shrink-0", iconClass)} strokeWidth={1.75} aria-hidden />
      <span className="truncate text-[13px] text-foreground/90">{type}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: RowStatus }) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "font-normal",
        status === "Active" &&
          "border-emerald-500/30 bg-emerald-500/15 text-emerald-400",
        status === "Draft" && "border-border bg-muted text-muted-foreground",
        status === "Completed" &&
          "border-blue-500/30 bg-blue-500/15 text-blue-400",
        status === "Paused" &&
          "border-amber-500/30 bg-amber-500/15 text-amber-400"
      )}
    >
      {status}
    </Badge>
  );
}

function CampaignsTableSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card/40 ring-1 ring-foreground/5">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Contacts</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="min-w-[11rem] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 6 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <Skeleton className="h-4 w-[min(100%,12rem)]" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-32" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-16 rounded-full" />
              </TableCell>
              <TableCell className="text-right">
                <Skeleton className="ml-auto h-4 w-10" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell className="text-right">
                <Skeleton className="ml-auto size-8 rounded-md" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function CampaignsList() {
  const router = useRouter();
  const [rows, setRows] = useState<CampaignRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [restarting, setRestarting] = useState<string | null>(null);
  const [starting, setStarting] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [restartDialog, setRestartDialog] = useState<{
    id: string;
    mode: "all" | "failed";
  } | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.name.toLowerCase().includes(q) || r.type.toLowerCase().includes(q)
    );
  }, [rows, search]);

  async function executeStart(campaignId: string) {
    setStarting(campaignId);
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/launch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = (await res.json()) as {
        error?: string;
        totalContacts?: number;
        callsInitiated?: number;
      };
      if (!res.ok) {
        toast.error(data.error ?? "Could not start campaign");
        return;
      }
      toast.success("Campaign started.");
      setRows((prev) =>
        prev.map((r) =>
          r.id === campaignId ? { ...r, status: "Active" } : r
        )
      );
    } catch {
      toast.error("Could not reach the server.");
    } finally {
      setStarting(null);
    }
  }

  async function executeRestart() {
    if (!restartDialog) return;
    const { id, mode } = restartDialog;
    setRestarting(id);
    try {
      const res = await fetch(`/api/campaigns/${id}/restart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode }),
      });
      const data = (await res.json()) as { error?: string; totalContacts?: number };
      if (!res.ok) {
        toast.error(data.error ?? "Restart failed");
        return;
      }
      toast.success(
        `Campaign restarted — ${data.totalContacts ?? 0} contacts queued.`
      );
      setRows((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "Active" } : r))
      );
      setRestartDialog(null);
    } catch {
      toast.error("Could not reach the server.");
    } finally {
      setRestarting(null);
    }
  }

  async function executeDelete() {
    if (!deleteDialog) return;
    const { id } = deleteDialog;
    setDeleting(id);
    try {
      const res = await fetch(`/api/campaigns/${id}`, { method: "DELETE" });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        toast.error(data.error ?? "Could not delete campaign.");
        return;
      }
      setRows((prev) => prev.filter((r) => r.id !== id));
      toast.success("Campaign deleted.");
      setDeleteDialog(null);
    } catch {
      toast.error("Could not reach the server.");
    } finally {
      setDeleting(null);
    }
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/campaigns");
        if (!res.ok) throw new Error("bad response");
        const data = (await res.json()) as ApiCampaign[];
        if (!cancelled) setRows(data.map(mapCampaign));
      } catch {
        toast.error("Could not load campaigns.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const restartDescription =
    restartDialog?.mode === "all"
      ? "This will reset all contacts to pending and begin dialing again."
      : "This will reset only failed contacts to pending and begin dialing them again.";

  return (
    <div className="space-y-6">
      <ConfirmDialog
        open={restartDialog !== null}
        onOpenChange={(open) => {
          if (!open) setRestartDialog(null);
        }}
        title="Restart campaign?"
        description={restartDescription}
        confirmLabel="Restart"
        pending={restartDialog !== null && restarting === restartDialog.id}
        onConfirm={() => void executeRestart()}
      />
      <ConfirmDialog
        open={deleteDialog !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteDialog(null);
        }}
        title="Delete campaign?"
        description={
          deleteDialog
            ? `Delete “${deleteDialog.name}”? This permanently removes the campaign, all contacts, call history, and the linked ElevenLabs agent.`
            : ""
        }
        confirmLabel="Delete"
        confirmVariant="destructive"
        pending={deleteDialog !== null && deleting === deleteDialog.id}
        onConfirm={() => void executeDelete()}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-sm font-medium text-muted-foreground">
            Campaigns
          </h2>
          <p className="max-w-lg text-[13px] leading-relaxed text-muted-foreground">
            Create and manage outbound AI calling campaigns from this view.
          </p>
        </div>
        <Link
          href="/dashboard/campaigns/new"
          className={buttonVariants({ variant: "default" })}
        >
          New Campaign
        </Link>
      </div>

      {!loading && rows.length > 0 ? (
        <div className="relative max-w-md">
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or type…"
            className="h-9 bg-background pl-9"
            aria-label="Search campaigns"
          />
        </div>
      ) : null}

      {loading ? (
        <CampaignsTableSkeleton />
      ) : rows.length === 0 ? (
        <ListEmptyState
          icon={Megaphone}
          title="No campaigns yet"
          description="Create your first outbound campaign to upload contacts, configure your AI voice agent, and start calling."
        >
          <Link
            href="/dashboard/campaigns/new"
            className={buttonVariants({ variant: "default" })}
          >
            Create your first campaign
          </Link>
        </ListEmptyState>
      ) : (
        <div className="rounded-xl border border-border bg-card/40 ring-1 ring-foreground/5">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Contacts</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="min-w-[11rem] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-12 text-center text-[13px] text-muted-foreground"
                  >
                    No campaigns match &ldquo;{search.trim()}&rdquo;. Try a
                    different search.
                  </TableCell>
                </TableRow>
              ) : (
                filteredRows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium text-foreground">
                      {row.name}
                    </TableCell>
                    <TableCell>
                      <TypeCell type={row.type} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={row.status} />
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {row.contacts.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {row.created}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {row.status === "Draft" ? (
                          <Button
                            type="button"
                            size="sm"
                            className="h-8 gap-1"
                            disabled={starting === row.id}
                            onClick={() => void executeStart(row.id)}
                          >
                            <Play className="size-3.5" aria-hidden />
                            Start
                          </Button>
                        ) : null}
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          className={buttonVariants({
                            variant: "ghost",
                            size: "icon-sm",
                            className: "text-muted-foreground",
                          })}
                          aria-label="Open actions"
                        >
                          <MoreHorizontal className="size-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="min-w-40">
                          <DropdownMenuItem
                            onClick={() => {
                              router.push(`/dashboard/campaigns/${row.id}`);
                            }}
                          >
                            <Eye className="size-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              router.push(`/dashboard/campaigns/${row.id}/edit`);
                            }}
                          >
                            <Pencil className="size-4" />
                            Edit details
                          </DropdownMenuItem>
                          {(row.status === "Completed" ||
                            row.status === "Paused" ||
                            row.status === "Active") && (
                            <DropdownMenuItem
                              disabled={restarting === row.id}
                              onClick={() =>
                                setRestartDialog({ id: row.id, mode: "all" })
                              }
                            >
                              <RefreshCw className="size-4" />
                              Restart (all contacts)
                            </DropdownMenuItem>
                          )}
                          {(row.status === "Completed" ||
                            row.status === "Paused" ||
                            row.status === "Active") && (
                            <DropdownMenuItem
                              disabled={restarting === row.id}
                              onClick={() =>
                                setRestartDialog({ id: row.id, mode: "failed" })
                              }
                            >
                              <RefreshCw className="size-4" />
                              Retry failed only
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            variant="destructive"
                            disabled={deleting === row.id}
                            onClick={() =>
                              setDeleteDialog({ id: row.id, name: row.name })
                            }
                          >
                            <Trash2 className="size-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
