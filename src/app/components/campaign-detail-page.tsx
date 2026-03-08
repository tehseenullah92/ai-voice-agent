"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "./ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Input } from "./ui/input";
import {
  ArrowLeft,
  Users,
  Phone,
  Clock,
  Target,
  Loader2,
  PhoneCall,
  CheckCircle2,
  XCircle,
  PhoneOff,
  AlertCircle,
  Play,
  Pause,
  UserPlus,
  ListPlus,
  Search,
  Trash2,
} from "lucide-react";
import { useAuth } from "../auth";
import { toast } from "sonner";

const statusStyles: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700 border-emerald-200",
  completed: "bg-[#1a8ee9]/10 text-[#1a8ee9] border-[#1a8ee9]/20",
  draft: "bg-gray-100 text-gray-600 border-gray-200",
  paused: "bg-amber-100 text-amber-700 border-amber-200",
};

const callStatusStyles: Record<string, string> = {
  pending: "bg-gray-100 text-gray-600 border-gray-200",
  in_progress: "bg-blue-100 text-blue-700 border-blue-200",
  completed: "bg-green-100 text-green-700 border-green-200",
  failed: "bg-red-100 text-red-700 border-red-200",
  no_answer: "bg-amber-100 text-amber-700 border-amber-200",
};

type Call = {
  id: string;
  clientId?: string;
  clientName?: string | null;
  clientPhone: string;
  status: string;
  duration?: number | null;
  outcome?: string | null;
  recordingUrl?: string | null;
  transcript?: string | null;
  createdAt: string;
};

type Client = {
  id: string;
  name: string;
  phone: string;
  location: string;
  status: string;
  tags: string[];
};

type Lead = {
  id: string;
  name: string;
  phone: string;
  interest: string;
  status: string;
  date: string;
};

type CampaignState = {
  id: string;
  name: string;
  project: string;
  totalClients: number;
  called: number;
  remaining: number;
  interested: number;
  status: string;
  createdAt: string;
  language: string;
  concurrency: number;
};

export function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [campaign, setCampaign] = useState<CampaignState | null>(null);
  const [calls, setCalls] = useState<Call[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [allClients, setAllClients] = useState<Client[]>([]);
  const [clientLists, setClientLists] = useState<Array<{ id: string; name: string; memberIds: string[] }>>([]);
  const [loading, setLoading] = useState(true);
  const [callFilter, setCallFilter] = useState<string>("all");
  const [addClientOpen, setAddClientOpen] = useState(false);
  const [addListOpen, setAddListOpen] = useState(false);
  const [clientSearch, setClientSearch] = useState("");
  const [adding, setAdding] = useState(false);
  const [starting, setStarting] = useState(false);
  const [pausing, setPausing] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const [callLogClientPhone, setCallLogClientPhone] = useState<string | null>(null);

  const load = async (silent = false) => {
    if (!user?.email || !id) return;
    if (!silent) setLoading(true);
    try {
      const [campaignRes, callsRes, leadsRes, clientsRes, listsRes] = await Promise.all([
        fetch(`/api/campaigns/${id}`, { headers: { "x-user-email": user.email } }),
        fetch(`/api/campaigns/${id}/calls`, { headers: { "x-user-email": user.email } }),
        fetch(`/api/leads?campaignId=${id}`, { headers: { "x-user-email": user.email } }),
        fetch(`/api/clients`, { headers: { "x-user-email": user.email } }),
        fetch(`/api/client-lists`, { headers: { "x-user-email": user.email } }),
      ]);

      if (!campaignRes.ok) {
        if (campaignRes.status === 404) {
          toast.error("Campaign not found");
          navigate("/dashboard/campaigns");
          return;
        }
        throw new Error("Failed to load campaign");
      }

      const campaignJson = await campaignRes.json();
      const callsJson = await callsRes.json();
      const leadsJson = await leadsRes.json();
      const clientsJson = await clientsRes.json();
      const listsJson = await listsRes.json();

      const c = campaignJson.campaign;
      setCampaign({
        id: c.id,
        name: c.name,
        project: c.project,
        totalClients: c.totalClients ?? 0,
        called: c.called ?? 0,
        remaining: c.remaining ?? 0,
        interested: c.interested ?? 0,
        status: c.status,
        createdAt: c.createdAt?.split("T")[0] ?? "",
        language: c.language ?? "Urdu",
        concurrency: c.concurrency ?? 5,
      });

      setCalls((callsJson.calls ?? []).map((x: any) => ({
        id: x.id,
        clientId: x.clientId,
        clientName: x.clientName,
        clientPhone: x.clientPhone,
        status: x.status,
        duration: x.duration,
        outcome: x.outcome,
        recordingUrl: x.recordingUrl,
        transcript: x.transcript,
        createdAt: x.createdAt,
      })));

      setLeads((leadsJson.leads ?? []).map((l: any) => ({
        id: l.id,
        name: l.name,
        phone: l.phone,
        interest: l.interest ?? "cold",
        status: l.status ?? "new",
        date: l.date?.split("T")[0] ?? "",
      })));

      setAllClients((clientsJson.clients ?? []).map((c: any) => ({
        id: c.id,
        name: c.name,
        phone: c.phone,
        location: c.location ?? "N/A",
        status: c.status ?? "active",
        tags: c.tags ? (Array.isArray(c.tags) ? c.tags : String(c.tags).split(",").map((t: string) => t.trim()).filter(Boolean)) : [],
      })));

      setClientLists((listsJson.lists ?? []).map((l: any) => ({
        id: l.id,
        name: l.name,
        memberIds: l.memberIds ?? [],
      })));
    } catch (err: unknown) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Failed to load campaign");
      navigate("/dashboard/campaigns");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [user?.email, id, navigate]);

  const addClientsToCampaign = async (clientIds: string[]) => {
    if (!user?.email || !id || clientIds.length === 0) return;
    setAdding(true);
    try {
      const res = await fetch(`/api/campaigns/${id}/calls`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": user.email,
        },
        body: JSON.stringify({ clientIds }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add clients");
      toast.success(data.created > 0 ? `Added ${data.created} client(s) to queue` : data.message ?? "Done");
      setAddClientOpen(false);
      setClientSearch("");
      await load(true);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to add clients");
    } finally {
      setAdding(false);
    }
  };

  const removeClientFromCampaign = async (callIds: string[]) => {
    if (!user?.email || !id || callIds.length === 0) return;
    setRemoving(callIds[0]);
    try {
      for (const callId of callIds) {
        const res = await fetch(`/api/campaigns/${id}/calls/${callId}`, {
          method: "DELETE",
          headers: { "x-user-email": user.email },
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Failed to remove client");
        }
      }
      toast.success("Client removed from campaign");
      await load(true);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to remove client");
    } finally {
      setRemoving(null);
    }
  };

  const addListToCampaign = async (listId: string) => {
    if (!user?.email || !id) return;
    setAdding(true);
    try {
      const res = await fetch(`/api/campaigns/${id}/calls`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": user.email,
        },
        body: JSON.stringify({ clientListId: listId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add list");
      toast.success(data.created > 0 ? `Added ${data.created} client(s) from list` : data.message ?? "Done");
      setAddListOpen(false);
      await load(true);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to add list");
    } finally {
      setAdding(false);
    }
  };

  const filteredClients = allClients.filter(
    (c) =>
      c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
      c.phone.includes(clientSearch)
  );

  const handleStart = async () => {
    if (!user?.email || !id || !campaign) return;
    if (campaign.totalClients === 0) {
      toast.error("Add clients to the campaign first");
      return;
    }
    setStarting(true);
    try {
      const res = await fetch(`/api/campaigns/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": user.email,
        },
        body: JSON.stringify({ status: "active" }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to start");
      }
      setCampaign((p) => (p ? { ...p, status: "active" } : p));
      toast.success("Campaign started");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to start campaign");
    } finally {
      setStarting(false);
    }
  };

  const handlePause = async () => {
    if (!user?.email || !id) return;
    setPausing(true);
    try {
      const res = await fetch(`/api/campaigns/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": user.email,
        },
        body: JSON.stringify({ status: "paused" }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to pause");
      }
      setCampaign((p) => (p ? { ...p, status: "paused" } : p));
      toast.info("Campaign paused");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to pause");
    } finally {
      setPausing(false);
    }
  };

  const filteredCalls =
    callFilter === "all" ? calls : calls.filter((c) => c.status === callFilter);

  const callsByStatus = {
    in_progress: calls.filter((c) => c.status === "in_progress").length,
    completed: calls.filter((c) => c.status === "completed").length,
    failed: calls.filter((c) => c.status === "failed").length,
    no_answer: calls.filter((c) => c.status === "no_answer").length,
    pending: calls.filter((c) => c.status === "pending").length,
  };

  const formatDuration = (sec?: number | null) => {
    if (sec == null) return "—";
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  };

  const clientCallLogs = callLogClientPhone
    ? [...calls.filter((c) => c.clientPhone === callLogClientPhone)].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    : [];

  const clientsInQueue = calls.reduce((acc, c) => {
    const key = c.clientPhone;
    const existing = acc.find((x) => x.phone === key);
    if (existing) {
      existing.callIds.push(c.id);
    } else {
      acc.push({
        id: c.clientId ?? c.id,
        name: c.clientName ?? "Unknown",
        phone: c.clientPhone,
        location: "N/A",
        status: "active",
        tags: [],
        callIds: [c.id],
      });
    }
    return acc;
  }, [] as Array<Client & { callIds: string[] }>);

  if (loading || !campaign) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const progress =
    campaign.totalClients > 0
      ? Math.round((campaign.called / campaign.totalClients) * 100)
      : 0;

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard/campaigns")}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold">{campaign.name}</h1>
            <p className="text-sm text-muted-foreground">{campaign.project}</p>
          </div>
        </div>
        <Badge className={statusStyles[campaign.status] ?? ""}>
          {campaign.status}
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Total Clients</p>
            </div>
            <p className="text-2xl mt-1">{campaign.totalClients}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-green-500" />
              <p className="text-xs text-muted-foreground">Called</p>
            </div>
            <p className="text-2xl mt-1">{campaign.called}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <p className="text-xs text-muted-foreground">Remaining</p>
            </div>
            <p className="text-2xl mt-1">{campaign.remaining}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-orange-500" />
              <p className="text-xs text-muted-foreground">Interested</p>
            </div>
            <p className="text-2xl mt-1">{campaign.interested}</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress bar */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium">Call Progress</p>
            <span className="text-sm text-muted-foreground">{progress}%</span>
          </div>
          <Progress value={progress} />
        </CardContent>
      </Card>

      {/* Add to campaign */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <Popover open={addClientOpen} onOpenChange={setAddClientOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add clients
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[320px] p-0" align="start">
                  <div className="p-2 border-b">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search clients..."
                        value={clientSearch}
                        onChange={(e) => setClientSearch(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>
                  <div className="max-h-[240px] overflow-y-auto">
                    {filteredClients.map((c) => (
                      <button
                        key={c.id}
                        className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-muted text-sm disabled:opacity-50"
                        disabled={adding}
                        onClick={() => void addClientsToCampaign([c.id])}
                      >
                        <span className="font-medium">{c.name}</span>
                        <span className="text-muted-foreground text-xs">{c.phone}</span>
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
              <Popover open={addListOpen} onOpenChange={setAddListOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <ListPlus className="w-4 h-4 mr-2" />
                    Add list
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[240px] p-2" align="start">
                  {clientLists.map((list) => (
                    <button
                      key={list.id}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-muted text-sm text-left disabled:opacity-50"
                      disabled={adding}
                      onClick={() => void addListToCampaign(list.id)}
                    >
                      <span>{list.name}</span>
                      <span className="text-muted-foreground text-xs">
                        {list.memberIds.length} clients
                      </span>
                    </button>
                  ))}
                </PopoverContent>
              </Popover>
              <span className="text-sm text-muted-foreground">
                {campaign.totalClients} clients in queue
              </span>
            </div>
            {(campaign.status === "draft" || campaign.status === "paused") && (
              <Button
                onClick={() => void handleStart()}
                disabled={campaign.totalClients === 0 || starting}
              >
                {starting ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Play className="w-4 h-4 mr-2" />
                )}
                Start Campaign
              </Button>
            )}
            {campaign.status === "active" && (
              <Button variant="outline" onClick={() => void handlePause()} disabled={pausing} className="gap-2">
                {pausing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Pause className="w-4 h-4" />}
                Pause
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="calls" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="calls">
            <PhoneCall className="w-4 h-4 mr-2" />
            Calls ({calls.length})
          </TabsTrigger>
          <TabsTrigger value="clients">
            <Users className="w-4 h-4 mr-2" />
            Clients ({clientsInQueue.length})
          </TabsTrigger>
          <TabsTrigger value="leads">
            <Target className="w-4 h-4 mr-2" />
            Leads ({leads.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calls" className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={callFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setCallFilter("all")}
            >
              All ({calls.length})
            </Button>
            <Button
              variant={callFilter === "in_progress" ? "default" : "outline"}
              size="sm"
              onClick={() => setCallFilter("in_progress")}
            >
              In Progress ({callsByStatus.in_progress})
            </Button>
            <Button
              variant={callFilter === "completed" ? "default" : "outline"}
              size="sm"
              onClick={() => setCallFilter("completed")}
            >
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Completed ({callsByStatus.completed})
            </Button>
            <Button
              variant={callFilter === "failed" ? "default" : "outline"}
              size="sm"
              onClick={() => setCallFilter("failed")}
            >
              <XCircle className="w-3 h-3 mr-1" />
              Failed ({callsByStatus.failed})
            </Button>
            <Button
              variant={callFilter === "no_answer" ? "default" : "outline"}
              size="sm"
              onClick={() => setCallFilter("no_answer")}
            >
              <PhoneOff className="w-3 h-3 mr-1" />
              No Answer ({callsByStatus.no_answer})
            </Button>
            <Button
              variant={callFilter === "pending" ? "default" : "outline"}
              size="sm"
              onClick={() => setCallFilter("pending")}
            >
              <AlertCircle className="w-3 h-3 mr-1" />
              Pending ({callsByStatus.pending})
            </Button>
          </div>

          <Card>
            <CardContent className="pt-0 px-0">
              {filteredCalls.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  <PhoneCall className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">
                    {callFilter === "all"
                      ? "No calls yet. Add clients or a list above."
                      : `No ${callFilter.replace("_", " ")} calls.`}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Contact</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Outcome</TableHead>
                      <TableHead className="hidden sm:table-cell">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCalls.map((call) => (
                      <TableRow
                        key={call.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => setCallLogClientPhone(call.clientPhone)}
                      >
                        <TableCell>
                          <div>
                            <p className="text-sm font-medium">
                              {call.clientName || "Unknown"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {call.clientPhone}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              callStatusStyles[call.status] ??
                              "bg-gray-100 text-gray-600"
                            }
                          >
                            {call.status.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDuration(call.duration)}</TableCell>
                        <TableCell>{call.outcome || "—"}</TableCell>
                        <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                          {formatDate(call.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients" className="space-y-4">
          <Card>
            <CardContent className="pt-0 px-0">
              {clientsInQueue.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No clients in queue yet.</p>
                  <p className="text-xs mt-1">
                    Use "Add clients" or "Add list" above to add contacts.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead className="hidden sm:table-cell">Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[60px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clientsInQueue.map((client) => (
                      <TableRow
                        key={client.phone}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => setCallLogClientPhone(client.phone)}
                      >
                        <TableCell className="font-medium">{client.name}</TableCell>
                        <TableCell>{client.phone}</TableCell>
                        <TableCell className="hidden sm:table-cell text-muted-foreground">
                          {client.location}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{client.status}</Badge>
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            disabled={removing !== null}
                            onClick={() =>
                              void removeClientFromCampaign(client.callIds)
                            }
                            title="Remove from campaign"
                          >
                            {removing === client.callIds[0] ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leads" className="space-y-4">
          <Card>
            <CardContent className="pt-0 px-0">
              {leads.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No leads yet from this campaign.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Interest</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden sm:table-cell">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell className="font-medium">{lead.name}</TableCell>
                        <TableCell>{lead.phone}</TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={
                              lead.interest === "hot"
                                ? "bg-orange-100 text-orange-700"
                                : lead.interest === "warm"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-gray-100 text-gray-600"
                            }
                          >
                            {lead.interest}
                          </Badge>
                        </TableCell>
                        <TableCell>{lead.status}</TableCell>
                        <TableCell className="hidden sm:table-cell text-muted-foreground">
                          {lead.date}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog
        open={!!callLogClientPhone}
        onOpenChange={(open) => !open && setCallLogClientPhone(null)}
      >
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Call logs</DialogTitle>
            <DialogDescription>
              {callLogClientPhone && (
                <>
                  {clientCallLogs[0]?.clientName || "Unknown"} · {callLogClientPhone}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          {clientCallLogs.length === 0 ? (
            <p className="py-6 text-center text-muted-foreground text-sm">
              No call logs for this client.
            </p>
          ) : (
            <div className="space-y-4">
              {clientCallLogs.map((call) => (
                <Card key={call.id}>
                  <CardContent className="pt-4 space-y-4">
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <Badge
                        className={
                          callStatusStyles[call.status] ??
                          "bg-gray-100 text-gray-600"
                        }
                      >
                        {call.status.replace("_", " ")}
                      </Badge>
                      <span className="text-muted-foreground">
                        {formatDuration(call.duration)}
                      </span>
                      <span className="text-muted-foreground">
                        {call.outcome || "—"}
                      </span>
                      <span className="text-muted-foreground">
                        {formatDate(call.createdAt)}
                      </span>
                    </div>
                    {call.recordingUrl && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-2">
                          Recording
                        </p>
                        <audio
                          controls
                          src={call.recordingUrl}
                          className="w-full max-w-md h-9"
                        />
                      </div>
                    )}
                    {call.transcript && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-2">
                          Transcript
                        </p>
                        <pre className="p-3 rounded-md bg-muted text-sm overflow-x-auto max-h-48 overflow-y-auto whitespace-pre-wrap">
                          {call.transcript}
                        </pre>
                      </div>
                    )}
                    {!call.recordingUrl && !call.transcript && (
                      <p className="text-xs text-muted-foreground italic">
                        No recording or transcript available.
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
