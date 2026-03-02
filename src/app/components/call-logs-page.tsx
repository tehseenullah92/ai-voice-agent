import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "./ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import {
  Phone, Search, Clock, PlayCircle, CheckCircle2, XCircle, PhoneMissed,
  Eye, Megaphone, Calendar, FileText, Volume2,
} from "lucide-react";
import { callLogs } from "./mock-data";
import { toast } from "sonner";

const statusStyles: Record<string, string> = {
  completed: "bg-green-100 text-green-700 border-green-200",
  "no-answer": "bg-amber-100 text-amber-700 border-amber-200",
  failed: "bg-red-100 text-red-700 border-red-200",
};

const outcomeStyles: Record<string, string> = {
  interested: "bg-emerald-100 text-emerald-700 border-emerald-200",
  not_interested: "bg-red-100 text-red-700 border-red-200",
  callback: "bg-[#1a8ee9]/10 text-[#1a8ee9] border-[#1a8ee9]/20",
  no_answer: "bg-amber-100 text-amber-700 border-amber-200",
};

const statusIcon = (status: string) => {
  if (status === "completed") return <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />;
  if (status === "no-answer") return <PhoneMissed className="w-3.5 h-3.5 text-amber-500" />;
  return <XCircle className="w-3.5 h-3.5 text-red-500" />;
};

export function CallLogsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [outcomeFilter, setOutcomeFilter] = useState("all");
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<typeof callLogs[0] | null>(null);
  const [playing, setPlaying] = useState(false);

  const filtered = callLogs.filter((log) => {
    const matchesSearch = log.clientName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesOutcome = outcomeFilter === "all" || log.outcome === outcomeFilter;
    return matchesSearch && matchesOutcome;
  });

  const openView = (log: typeof callLogs[0]) => {
    setSelectedLog(log);
    setPlaying(false);
    setViewOpen(true);
  };

  const togglePlay = () => {
    setPlaying(!playing);
    if (!playing) {
      toast.info("Playing recording...");
      setTimeout(() => setPlaying(false), 3000);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1>Call Logs</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Complete history of all AI-powered calls across campaigns.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="gap-3">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Total Calls</p>
            </div>
            <p className="text-2xl mt-1">{callLogs.length}</p>
          </CardContent>
        </Card>
        <Card className="gap-3">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
            <p className="text-2xl mt-1 text-green-600">
              {callLogs.filter((l) => l.status === "completed").length}
            </p>
          </CardContent>
        </Card>
        <Card className="gap-3">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2">
              <PhoneMissed className="w-4 h-4 text-amber-500" />
              <p className="text-xs text-muted-foreground">No Answer</p>
            </div>
            <p className="text-2xl mt-1 text-amber-500">
              {callLogs.filter((l) => l.status === "no-answer").length}
            </p>
          </CardContent>
        </Card>
        <Card className="gap-3">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Avg Duration</p>
            </div>
            <p className="text-2xl mt-1">2:34</p>
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
                placeholder="Search by client name..."
                className="bg-transparent outline-none text-sm w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              className="border border-border rounded-lg px-3 py-2 text-sm bg-transparent"
              value={outcomeFilter}
              onChange={(e) => setOutcomeFilter(e.target.value)}
            >
              <option value="all">All Outcomes</option>
              <option value="interested">Interested</option>
              <option value="not_interested">Not Interested</option>
              <option value="callback">Callback</option>
              <option value="no_answer">No Answer</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="pt-0 px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead className="hidden md:table-cell">Campaign</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead className="hidden sm:table-cell">Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden sm:table-cell">Outcome</TableHead>
                <TableHead className="w-10">View</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((log) => (
                <TableRow key={log.id} className="cursor-pointer" onClick={() => openView(log)}>
                  <TableCell>
                    <div>
                      <p className="text-sm">{log.clientName}</p>
                      <p className="text-xs text-muted-foreground">{log.phone}</p>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                    {log.campaign}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{log.date}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {log.duration}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      {statusIcon(log.status)}
                      <Badge className={statusStyles[log.status]}>
                        {log.status}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge className={outcomeStyles[log.outcome]}>
                      {log.outcome.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <button
                      className="p-1.5 rounded-md hover:bg-accent"
                      onClick={(e) => { e.stopPropagation(); openView(log); }}
                    >
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Call Log Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-blue-500" />
              Call Details
            </DialogTitle>
            <DialogDescription>View call log details and outcome.</DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-sm">
                  {selectedLog.clientName.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <p className="text-base">{selectedLog.clientName}</p>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
                    <Phone className="w-3 h-3" />
                    {selectedLog.phone}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <div className="flex items-center gap-1.5">
                  {statusIcon(selectedLog.status)}
                  <Badge className={statusStyles[selectedLog.status]}>
                    {selectedLog.status}
                  </Badge>
                </div>
                <Badge className={outcomeStyles[selectedLog.outcome]}>
                  {selectedLog.outcome.replace("_", " ")}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-border pt-4">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Megaphone className="w-3 h-3" />
                    Campaign
                  </div>
                  <p className="text-sm mt-0.5">{selectedLog.campaign}</p>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    Date & Time
                  </div>
                  <p className="text-sm mt-0.5">{selectedLog.date}</p>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    Duration
                  </div>
                  <p className="text-sm mt-0.5">{selectedLog.duration}</p>
                </div>
              </div>

              {/* Simulated recording player */}
              {selectedLog.status === "completed" && (
                <div className="border-t border-border pt-4">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                    <Volume2 className="w-3 h-3" />
                    Call Recording
                  </div>
                  <div className="bg-accent/50 rounded-lg p-3 flex items-center gap-3">
                    <button
                      onClick={togglePlay}
                      className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shrink-0"
                    >
                      {playing ? (
                        <span className="w-3 h-3 border-l-2 border-r-2 border-primary-foreground" />
                      ) : (
                        <PlayCircle className="w-5 h-5 text-primary-foreground" />
                      )}
                    </button>
                    <div className="flex-1">
                      <div className="h-1.5 bg-border rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-[3000ms]"
                          style={{ width: playing ? "100%" : "0%" }}
                        />
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-[10px] text-muted-foreground">
                          {playing ? "0:15" : "0:00"}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {selectedLog.duration}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Simulated transcript snippet */}
              <div className="border-t border-border pt-4">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                  <FileText className="w-3 h-3" />
                  AI Summary
                </div>
                <div className="bg-accent/50 rounded-lg p-3 text-sm">
                  {selectedLog.outcome === "interested"
                    ? "Client expressed strong interest in the project. Wants to schedule a site visit and discussed budget range. Follow-up recommended within 24 hours."
                    : selectedLog.outcome === "callback"
                    ? "Client was busy and requested a callback. Showed initial interest but needs more time. Callback scheduled for next available slot."
                    : selectedLog.outcome === "not_interested"
                    ? "Client politely declined. Not currently looking for real estate investment. No follow-up needed."
                    : "Call was not answered after multiple rings. System will retry according to campaign retry settings."}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}