import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "./ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "./ui/select";
import {
  Megaphone, Plus, Play, Pause, Eye, Pencil, Phone, Users, Target, Clock, Globe, Loader2,
} from "lucide-react";
import { useAuth } from "../auth";
import { toast } from "sonner";

type CampaignStatus = "active" | "completed" | "draft" | "paused";

const statusStyles: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700 border-emerald-200",
  completed: "bg-[#1a8ee9]/10 text-[#1a8ee9] border-[#1a8ee9]/20",
  draft: "bg-gray-100 text-gray-600 border-gray-200",
  paused: "bg-amber-100 text-amber-700 border-amber-200",
};

const defaultForm = {
  name: "",
  project: "",
  language: "Urdu",
  concurrency: "5",
};

type Campaign = {
  id: string;
  name: string;
  project: string;
  totalClients: number;
  called: number;
  remaining: number;
  interested: number;
  status: CampaignStatus;
  createdAt: string;
  language: string;
  concurrency: number;
  clientListId?: string | null;
};

export function CampaignsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [campaignsList, setCampaignsList] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!user?.email) return;
      setLoading(true);
      try {
        const res = await fetch("/api/campaigns", {
          headers: { "x-user-email": user.email },
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Failed to load campaigns");
        }
        const data = await res.json();
        const mapped: Campaign[] = (data.campaigns ?? []).map((c: any) => ({
          id: c.id,
          name: c.name,
          project: c.project,
          totalClients: c.totalClients ?? 0,
          called: c.called ?? 0,
          remaining: c.remaining ?? 0,
          interested: c.interested ?? 0,
          status: c.status as CampaignStatus,
          createdAt: c.createdAt?.split("T")[0] ?? "",
          language: c.language ?? "Urdu",
          concurrency: c.concurrency ?? 5,
          clientListId: c.clientListKey ?? null,
        }));
        setCampaignsList(mapped);
      } catch (err: any) {
        console.error(err);
        toast.error(err.message || "Failed to load campaigns");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.email]);

  const handleCreate = async () => {
    if (!form.name || !form.project) {
      toast.error("Campaign name and project are required");
      return;
    }
    if (!user?.email) return;
    setCreating(true);
    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": user.email,
        },
        body: JSON.stringify({
          name: form.name,
          project: form.project,
          language: form.language,
          concurrency: form.concurrency,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create campaign");
      }
      const data = await res.json();
      const c = data.campaign;
      const mapped: Campaign = {
        id: c.id,
        name: c.name,
        project: c.project,
        totalClients: c.totalClients ?? 0,
        called: c.called ?? 0,
        remaining: c.remaining ?? 0,
        interested: c.interested ?? 0,
        status: c.status as CampaignStatus,
        createdAt: c.createdAt?.split("T")[0] ?? "",
        language: c.language ?? "Urdu",
        concurrency: c.concurrency ?? 5,
        clientListId: c.clientListKey ?? null,
      };
      setCampaignsList((prev) => [mapped, ...prev]);
      setForm(defaultForm);
      setCreateOpen(false);
      toast.success(`Campaign "${mapped.name}" created. Add clients and start calling.`);
      navigate(`/dashboard/campaigns/${mapped.id}`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to create campaign");
    } finally {
      setCreating(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedCampaign || !form.name) return;
    setEditing(true);
    try {
      const res = await fetch(`/api/campaigns/${selectedCampaign.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          project: form.project,
          language: form.language,
          concurrency: form.concurrency,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to update campaign");
      }
      const data = await res.json();
      const updated = data.campaign;
      setCampaignsList((prev) =>
        prev.map((c) =>
          c.id === selectedCampaign.id
            ? {
                ...c,
                name: updated.name,
                project: updated.project,
                language: updated.language ?? "Urdu",
                concurrency: updated.concurrency ?? c.concurrency,
              }
            : c
        )
      );
      setEditOpen(false);
      toast.success("Campaign updated successfully");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to update campaign");
    } finally {
      setEditing(false);
    }
  };

  const toggleStatus = async (id: string, newStatus: CampaignStatus) => {
    try {
      const res = await fetch(`/api/campaigns/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to update status");
      }
      setCampaignsList((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
      );
      const labels: Record<string, string> = {
        active: "started",
        paused: "paused",
        draft: "reset to draft",
        completed: "completed",
      };
      toast.success(`Campaign ${labels[newStatus] || newStatus}`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to update status");
    }
  };

  const openView = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setViewOpen(true);
  };

  const openEditDialog = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setForm({
      ...defaultForm,
      name: campaign.name,
      project: campaign.project,
      language: campaign.language,
      concurrency: String(campaign.concurrency),
    });
    setEditOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1>Campaigns</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Create and manage your AI calling campaigns.
          </p>
        </div>
        <Button size="sm" onClick={() => { setForm(defaultForm); setCreateOpen(true); }}>
          <Plus className="w-4 h-4" />
          New Campaign
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="gap-3">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">Total Campaigns</p>
            <p className="text-2xl mt-1">{campaignsList.length}</p>
          </CardContent>
        </Card>
        <Card className="gap-3">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">Active</p>
            <p className="text-2xl mt-1 text-green-600">
              {campaignsList.filter((c) => c.status === "active").length}
            </p>
          </CardContent>
        </Card>
        <Card className="gap-3">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">Total Clients Reached</p>
            <p className="text-2xl mt-1">
              {campaignsList.reduce((sum, c) => sum + c.called, 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card className="gap-3">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">Total Interested</p>
            <p className="text-2xl mt-1 text-orange-500">
              {campaignsList.reduce((sum, c) => sum + c.interested, 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="pt-0 px-0">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              <span className="text-sm text-muted-foreground">Loading campaigns...</span>
            </div>
          ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead className="hidden md:table-cell">Project</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead className="hidden sm:table-cell">Interested</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden lg:table-cell">Language</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaignsList.map((campaign) => {
                const progress = campaign.totalClients > 0
                  ? Math.round((campaign.called / campaign.totalClients) * 100)
                  : 0;
                return (
                  <TableRow
                  key={campaign.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => navigate(`/dashboard/campaigns/${campaign.id}`)}
                >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                          <Megaphone className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{campaign.name}</p>
                          <p className="text-xs text-muted-foreground md:hidden">
                            {campaign.project}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {campaign.project}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 min-w-[120px]">
                        <Progress value={progress} className="flex-1" />
                        <span className="text-xs text-muted-foreground w-14 text-right">
                          {campaign.called}/{campaign.totalClients}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span className="text-sm text-orange-500">{campaign.interested}</span>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusStyles[campaign.status]}>
                        {campaign.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                      {campaign.language}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1">
                        <button
                          className="p-1.5 rounded-md hover:bg-accent"
                          title="View"
                          onClick={() => navigate(`/dashboard/campaigns/${campaign.id}`)}
                        >
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        </button>
                        {(campaign.status === "draft" || campaign.status === "paused") && (
                          <button
                            className="p-1.5 rounded-md hover:bg-accent"
                            title="Edit"
                            onClick={() => openEditDialog(campaign)}
                          >
                            <Pencil className="w-4 h-4 text-muted-foreground" />
                          </button>
                        )}
                        {campaign.status === "active" && (
                          <button
                            className="p-1.5 rounded-md hover:bg-accent"
                            title="Pause"
                            onClick={() => toggleStatus(campaign.id, "paused")}
                          >
                            <Pause className="w-4 h-4 text-amber-500" />
                          </button>
                        )}
                        {(campaign.status === "paused" || campaign.status === "draft") && (
                          <button
                            className="p-1.5 rounded-md hover:bg-accent"
                            title="Start"
                            onClick={() => toggleStatus(campaign.id, "active")}
                          >
                            <Play className="w-4 h-4 text-green-600" />
                          </button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Campaign Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Create New Campaign</DialogTitle>
            <DialogDescription>
              Create a campaign, then add clients or lists on the campaign page and click Start.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Campaign Name *</Label>
                <Input
                  placeholder="e.g., DHA Phase 5 Launch"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Project *</Label>
                <Input
                  placeholder="e.g., DHA Islamabad Phase 5"
                  value={form.project}
                  onChange={(e) => setForm({ ...form, project: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Language</Label>
                <Select value={form.language} onValueChange={(v) => setForm({ ...form, language: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Urdu">Urdu</SelectItem>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Concurrency</Label>
                <Input
                  type="number"
                  min={1}
                  max={20}
                  value={form.concurrency}
                  onChange={(e) => setForm({ ...form, concurrency: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={creating}>Cancel</Button>
            <Button onClick={() => void handleCreate()} disabled={creating} className="gap-2">
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Create Campaign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Campaign Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-purple-600" />
              {selectedCampaign?.name}
            </DialogTitle>
            <DialogDescription>{selectedCampaign?.project}</DialogDescription>
          </DialogHeader>
          {selectedCampaign && (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-2">
                <Badge className={statusStyles[selectedCampaign.status]}>
                  {selectedCampaign.status}
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  {selectedCampaign.language}
                </Badge>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-accent/50 rounded-lg p-3 text-center">
                  <Users className="w-4 h-4 mx-auto text-muted-foreground" />
                  <p className="text-lg mt-1">{selectedCampaign.totalClients}</p>
                  <p className="text-xs text-muted-foreground">Total Clients</p>
                </div>
                <div className="bg-accent/50 rounded-lg p-3 text-center">
                  <Phone className="w-4 h-4 mx-auto text-green-500" />
                  <p className="text-lg mt-1">{selectedCampaign.called}</p>
                  <p className="text-xs text-muted-foreground">Called</p>
                </div>
                <div className="bg-accent/50 rounded-lg p-3 text-center">
                  <Clock className="w-4 h-4 mx-auto text-amber-500" />
                  <p className="text-lg mt-1">{selectedCampaign.remaining}</p>
                  <p className="text-xs text-muted-foreground">Remaining</p>
                </div>
                <div className="bg-accent/50 rounded-lg p-3 text-center">
                  <Target className="w-4 h-4 mx-auto text-orange-500" />
                  <p className="text-lg mt-1">{selectedCampaign.interested}</p>
                  <p className="text-xs text-muted-foreground">Interested</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-2">Call Progress</p>
                <Progress
                  value={selectedCampaign.totalClients > 0
                    ? Math.round((selectedCampaign.called / selectedCampaign.totalClients) * 100)
                    : 0}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedCampaign.totalClients > 0
                    ? Math.round((selectedCampaign.called / selectedCampaign.totalClients) * 100)
                    : 0}% complete
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-border pt-4">
                <div>
                  <p className="text-xs text-muted-foreground">Concurrency</p>
                  <p className="text-sm">{selectedCampaign.concurrency} calls</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Created</p>
                  <p className="text-sm">{selectedCampaign.createdAt}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            {selectedCampaign && selectedCampaign.status !== "completed" && (
              <Button
                variant="outline"
                onClick={() => {
                  openEditDialog(selectedCampaign);
                  setViewOpen(false);
                }}
              >
                <Pencil className="w-4 h-4" />
                Edit
              </Button>
            )}
            <Button variant="outline" onClick={() => setViewOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Campaign Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Edit Campaign</DialogTitle>
            <DialogDescription>Update campaign configuration.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Campaign Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Project</Label>
                <Input
                  value={form.project}
                  onChange={(e) => setForm({ ...form, project: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Language</Label>
                <Select value={form.language} onValueChange={(v) => setForm({ ...form, language: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Urdu">Urdu</SelectItem>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Concurrency</Label>
                <Input
                  type="number"
                  min={1}
                  max={20}
                  value={form.concurrency}
                  onChange={(e) => setForm({ ...form, concurrency: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)} disabled={editing}>Cancel</Button>
            <Button onClick={handleEdit} disabled={editing} className="gap-2">
              {editing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Update Campaign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}