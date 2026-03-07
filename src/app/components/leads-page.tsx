import { useEffect, useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "./ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "./ui/dialog";
import {
  Target, Search, Download, UserPlus, Eye, Flame, Thermometer, Snowflake,
  Phone, Megaphone, Calendar, FileText, Loader2,
} from "lucide-react";
import { useAuth } from "../auth";
import { toast } from "sonner";

const interestStyles: Record<string, string> = {
  hot: "bg-red-100 text-red-700 border-red-200",
  warm: "bg-amber-100 text-amber-700 border-amber-200",
  cold: "bg-[#1a8ee9]/10 text-[#1a8ee9] border-[#1a8ee9]/20",
};

const statusStyles: Record<string, string> = {
  new: "bg-emerald-100 text-emerald-700 border-emerald-200",
  "follow-up": "bg-amber-100 text-amber-700 border-amber-200",
  converted: "bg-[#1a8ee9]/10 text-[#1a8ee9] border-[#1a8ee9]/20",
  dead: "bg-gray-100 text-gray-600 border-gray-200",
};

const interestIcon = (level: string) => {
  if (level === "hot") return <Flame className="w-3 h-3" />;
  if (level === "warm") return <Thermometer className="w-3 h-3" />;
  return <Snowflake className="w-3 h-3" />;
};

type LeadInterest = "hot" | "warm" | "cold";
type LeadStatus = "new" | "follow-up" | "converted" | "dead";

type LeadType = {
  id: string;
  name: string;
  phone: string;
  campaign: string;
  project?: string;
  interest: LeadInterest;
  status: LeadStatus;
  assignedTo: string;
  date: string;
  notes?: string;
};

export function LeadsPage() {
  const { user } = useAuth();
  const [leadsList, setLeadsList] = useState<LeadType[]>([]);
  const [loading, setLoading] = useState(false);
  const [interestFilter, setInterestFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<LeadType | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!user?.email) return;
      setLoading(true);
      try {
        const res = await fetch("/api/leads", {
          headers: { "x-user-email": user.email },
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Failed to load leads");
        }
        const json = await res.json();
        const items: LeadType[] = (json.leads ?? []).map((l: any) => ({
          id: l.id,
          name: l.name,
          phone: l.phone,
          campaign: l.campaign ?? "",
          project: l.project ?? "",
          interest: l.interest as LeadInterest,
          status: (l.status === "follow_up" ? "follow-up" : l.status) as LeadStatus,
          assignedTo: l.assignedTo ?? "Unassigned",
          date: l.date,
          notes: l.notes ?? "",
        }));
        setLeadsList(items);
      } catch (err: any) {
        console.error(err);
        toast.error(err.message || "Failed to load leads");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user?.email]);

  const filtered = leadsList.filter((l) => {
    const name = l.name || "";
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesInterest = interestFilter === "all" || l.interest === interestFilter;
    return matchesSearch && matchesInterest;
  });

  const handleExport = () => {
    const headers = ["Client", "Phone", "Campaign", "Project", "Interest", "Status", "Assigned To", "Date", "Notes"];
    const rows = leadsList.map((l) => {
      const name = l.name || "";
      return [name, l.phone, l.campaign, l.project || "", l.interest, l.status, l.assignedTo, l.date, l.notes || ""];
    });
    const csvContent = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "convaire-leads.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${leadsList.length} leads to CSV`);
  };

  const openView = (lead: LeadType) => {
    setSelectedLead(lead);
    setViewOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1>Leads</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Auto-generated leads from AI calling campaigns.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="w-4 h-4" />
          Export Leads
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="gap-3">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Total Leads</p>
            </div>
            <p className="text-2xl mt-1">{leadsList.length}</p>
          </CardContent>
        </Card>
        <Card className="gap-3">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-red-500" />
              <p className="text-xs text-muted-foreground">Hot</p>
            </div>
            <p className="text-2xl mt-1 text-red-500">
              {leadsList.filter((l) => l.interest === "hot").length}
            </p>
          </CardContent>
        </Card>
        <Card className="gap-3">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-amber-500" />
              <p className="text-xs text-muted-foreground">Warm</p>
            </div>
            <p className="text-2xl mt-1 text-amber-500">
              {leadsList.filter((l) => l.interest === "warm").length}
            </p>
          </CardContent>
        </Card>
        <Card className="gap-3">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2">
              <Snowflake className="w-4 h-4 text-blue-500" />
              <p className="text-xs text-muted-foreground">Cold</p>
            </div>
            <p className="text-2xl mt-1 text-blue-500">
              {leadsList.filter((l) => l.interest === "cold").length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-2 flex-1 border border-border rounded-lg px-3 py-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search leads..."
                className="bg-transparent outline-none text-sm w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              className="border border-border rounded-lg px-3 py-2 text-sm bg-transparent"
              value={interestFilter}
              onChange={(e) => setInterestFilter(e.target.value)}
            >
              <option value="all">All Interest Levels</option>
              <option value="hot">Hot</option>
              <option value="warm">Warm</option>
              <option value="cold">Cold</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="pt-0 px-0">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              <span className="text-sm text-muted-foreground">
                Loading leads...
              </span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead className="hidden md:table-cell">Campaign</TableHead>
                  <TableHead>Interest</TableHead>
                  <TableHead className="hidden sm:table-cell">Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Assigned To</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((lead) => {
                  const name = lead.name || "";
                  return (
                    <TableRow key={lead.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-xs">
                            {name.split(" ").map((n: string) => n[0]).join("")}
                          </div>
                          <div>
                            <p className="text-sm">{name}</p>
                            <p className="text-xs text-muted-foreground">{lead.phone}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                        {lead.campaign}
                      </TableCell>
                      <TableCell>
                        <Badge className={interestStyles[lead.interest]}>
                          <span className="flex items-center gap-1">
                            {interestIcon(lead.interest)}
                            {lead.interest}
                          </span>
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge className={statusStyles[lead.status]}>
                          {lead.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <UserPlus className="w-3 h-3" />
                          {lead.assignedTo}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                        {lead.date}
                      </TableCell>
                      <TableCell>
                        <button
                          className="p-1.5 rounded-md hover:bg-accent"
                          onClick={() => openView(lead)}
                        >
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* View Lead Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-orange-500" />
              Lead Details
            </DialogTitle>
            <DialogDescription>View lead information, interest level, and notes.</DialogDescription>
          </DialogHeader>
          {selectedLead && (() => {
            const name = selectedLead.name || "";
            return (
              <div className="space-y-4 py-2">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-sm">
                    {name.split(" ").map((n: string) => n[0]).join("")}
                  </div>
                  <div>
                    <p className="text-base">{name}</p>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
                      <Phone className="w-3 h-3" />
                      {selectedLead.phone}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Badge className={interestStyles[selectedLead.interest]}>
                    <span className="flex items-center gap-1">
                      {interestIcon(selectedLead.interest)}
                      {selectedLead.interest}
                    </span>
                  </Badge>
                  <Badge className={statusStyles[selectedLead.status]}>
                    {selectedLead.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-border pt-4">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Megaphone className="w-3 h-3" />
                      Campaign
                    </div>
                    <p className="text-sm mt-0.5">{selectedLead.campaign}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Target className="w-3 h-3" />
                      Project
                    </div>
                    <p className="text-sm mt-0.5">{selectedLead.project || "N/A"}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <UserPlus className="w-3 h-3" />
                      Assigned To
                    </div>
                    <p className="text-sm mt-0.5">{selectedLead.assignedTo}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      Date
                    </div>
                    <p className="text-sm mt-0.5">{selectedLead.date}</p>
                  </div>
                </div>

                {selectedLead.notes && (
                  <div className="border-t border-border pt-4">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                      <FileText className="w-3 h-3" />
                      Notes
                    </div>
                    <div className="bg-accent/50 rounded-lg p-3 text-sm">
                      {selectedLead.notes}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}