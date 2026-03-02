import { useState } from "react";
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
import { Textarea } from "./ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "./ui/select";
import {
  Megaphone, Plus, Play, Pause, Eye, Pencil, Zap, Phone, Users, Target, Clock, Globe,
} from "lucide-react";
import { campaigns as initialCampaigns } from "./mock-data";
import { toast } from "sonner";

type CampaignStatus = "active" | "completed" | "draft" | "paused";

const statusStyles: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700 border-emerald-200",
  completed: "bg-[#1a8ee9]/10 text-[#1a8ee9] border-[#1a8ee9]/20",
  draft: "bg-gray-100 text-gray-600 border-gray-200",
  paused: "bg-amber-100 text-amber-700 border-amber-200",
};

const defaultForm = {
  name: "", project: "", language: "Urdu", concurrency: "5", clientList: "",
  voiceId: "", greeting: "", prompt: "", maxRetries: "2", callHoursStart: "09:00", callHoursEnd: "18:00",
};

export function CampaignsPage() {
  const [campaignsList, setCampaignsList] = useState(initialCampaigns);
  const [createOpen, setCreateOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<typeof initialCampaigns[0] | null>(null);
  const [form, setForm] = useState(defaultForm);

  const handleCreate = () => {
    if (!form.name || !form.project) {
      toast.error("Campaign name and project are required");
      return;
    }
    const newCampaign = {
      id: String(campaignsList.length + 1),
      name: form.name,
      project: form.project,
      totalClients: 0,
      called: 0,
      remaining: 0,
      interested: 0,
      status: "draft" as const,
      createdAt: new Date().toISOString().split("T")[0],
      language: form.language,
      concurrency: parseInt(form.concurrency),
    };
    setCampaignsList((prev) => [newCampaign, ...prev]);
    setForm(defaultForm);
    setCreateOpen(false);
    toast.success(`Campaign "${newCampaign.name}" created as draft`);
  };

  const handleEdit = () => {
    if (!selectedCampaign || !form.name) return;
    setCampaignsList((prev) =>
      prev.map((c) =>
        c.id === selectedCampaign.id
          ? { ...c, name: form.name, project: form.project, language: form.language, concurrency: parseInt(form.concurrency) }
          : c
      )
    );
    setEditOpen(false);
    toast.success("Campaign updated successfully");
  };

  const toggleStatus = (id: string, newStatus: CampaignStatus) => {
    setCampaignsList((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
    );
    const labels: Record<string, string> = {
      active: "started", paused: "paused", draft: "reset to draft",
    };
    toast.success(`Campaign ${labels[newStatus] || newStatus}`);
  };

  const openView = (campaign: typeof initialCampaigns[0]) => {
    setSelectedCampaign(campaign);
    setViewOpen(true);
  };

  const openEditDialog = (campaign: typeof initialCampaigns[0]) => {
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
                  <TableRow key={campaign.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                          <Megaphone className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm">{campaign.name}</p>
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
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <button
                          className="p-1.5 rounded-md hover:bg-accent"
                          title="View"
                          onClick={() => openView(campaign)}
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
                        {campaign.status === "active" && (
                          <button
                            className="p-1.5 rounded-md hover:bg-accent"
                            title="Trigger"
                            onClick={() => toast.info("Campaign trigger sent")}
                          >
                            <Zap className="w-4 h-4 text-blue-500" />
                          </button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Campaign Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Campaign</DialogTitle>
            <DialogDescription>
              Set up a new AI calling campaign with VAPI voice configuration.
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
            <div className="space-y-2">
              <Label>Client List</Label>
              <Select value={form.clientList} onValueChange={(v) => setForm({ ...form, clientList: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a client list..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="islamabad-investors">Islamabad Investors (234)</SelectItem>
                  <SelectItem value="dha-lahore">DHA Lahore Leads (156)</SelectItem>
                  <SelectItem value="karachi-hnw">Karachi High Net Worth (89)</SelectItem>
                  <SelectItem value="overseas">Overseas Pakistanis (178)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="border-t border-border pt-4">
              <p className="text-sm mb-3">VAPI Voice Configuration</p>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Voice ID</Label>
                  <Select value={form.voiceId} onValueChange={(v) => setForm({ ...form, voiceId: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a voice..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="urdu-male-1">Urdu Male - Professional</SelectItem>
                      <SelectItem value="urdu-female-1">Urdu Female - Friendly</SelectItem>
                      <SelectItem value="english-male-1">English Male - Business</SelectItem>
                      <SelectItem value="english-female-1">English Female - Conversational</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Greeting Message</Label>
                  <Textarea
                    placeholder="e.g., Assalam o Alaikum, I'm calling from Realty Corp..."
                    value={form.greeting}
                    onChange={(e) => setForm({ ...form, greeting: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>AI Prompt / Script</Label>
                  <Textarea
                    placeholder="Describe how the AI should conduct the call..."
                    value={form.prompt}
                    onChange={(e) => setForm({ ...form, prompt: e.target.value })}
                    className="min-h-[80px]"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Max Retries</Label>
                    <Input
                      type="number"
                      min={0}
                      max={5}
                      value={form.maxRetries}
                      onChange={(e) => setForm({ ...form, maxRetries: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Call Start</Label>
                    <Input
                      type="time"
                      value={form.callHoursStart}
                      onChange={(e) => setForm({ ...form, callHoursStart: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Call End</Label>
                    <Input
                      type="time"
                      value={form.callHoursEnd}
                      onChange={(e) => setForm({ ...form, callHoursEnd: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate}>
              <Plus className="w-4 h-4" />
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
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}