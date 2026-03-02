import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
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
  CalendarCheck, Plus, MapPin, PhoneForwarded, Calendar, List, User,
} from "lucide-react";
import { appointments as initialAppointments } from "./mock-data";
import { toast } from "sonner";

const statusStyles: Record<string, string> = {
  scheduled: "bg-[#1a8ee9]/10 text-[#1a8ee9] border-[#1a8ee9]/20",
  completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
  "no-show": "bg-amber-100 text-amber-700 border-amber-200",
};

const typeStyles: Record<string, string> = {
  site_visit: "bg-purple-100 text-purple-700 border-purple-200",
  callback: "bg-cyan-100 text-cyan-700 border-cyan-200",
};

const defaultForm = {
  clientName: "", phone: "", project: "", type: "site_visit", date: "", time: "", assignedAgent: "", notes: "",
};

export function AppointmentsPage() {
  const [view, setView] = useState<"list" | "calendar">("list");
  const [appointmentsList, setAppointmentsList] = useState(initialAppointments);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState(defaultForm);

  const handleAdd = () => {
    if (!form.clientName || !form.phone || !form.date || !form.time) {
      toast.error("Client name, phone, date and time are required");
      return;
    }
    const newApt = {
      id: String(appointmentsList.length + 1),
      clientName: form.clientName,
      phone: form.phone,
      project: form.project || "N/A",
      type: form.type as "site_visit" | "callback",
      scheduledAt: `${form.date} ${form.time}`,
      status: "scheduled" as const,
      assignedAgent: form.assignedAgent || "Unassigned",
    };
    setAppointmentsList((prev) => [newApt, ...prev]);
    setForm(defaultForm);
    setAddOpen(false);
    toast.success(`Appointment with ${newApt.clientName} created`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1>Appointments</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage site visits and callbacks booked by the AI agent.
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex border border-border rounded-lg overflow-hidden">
            <button
              className={`px-3 py-1.5 text-sm transition-colors ${view === "list" ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}
              onClick={() => setView("list")}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              className={`px-3 py-1.5 text-sm transition-colors ${view === "calendar" ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}
              onClick={() => setView("calendar")}
            >
              <Calendar className="w-4 h-4" />
            </button>
          </div>
          <Button size="sm" onClick={() => { setForm(defaultForm); setAddOpen(true); }}>
            <Plus className="w-4 h-4" />
            Add Appointment
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="gap-3">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-2xl mt-1">{appointmentsList.length}</p>
          </CardContent>
        </Card>
        <Card className="gap-3">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">Scheduled</p>
            <p className="text-2xl mt-1 text-blue-600">
              {appointmentsList.filter((a) => a.status === "scheduled").length}
            </p>
          </CardContent>
        </Card>
        <Card className="gap-3">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">Site Visits</p>
            <p className="text-2xl mt-1 text-purple-600">
              {appointmentsList.filter((a) => a.type === "site_visit").length}
            </p>
          </CardContent>
        </Card>
        <Card className="gap-3">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">Callbacks</p>
            <p className="text-2xl mt-1 text-cyan-600">
              {appointmentsList.filter((a) => a.type === "callback").length}
            </p>
          </CardContent>
        </Card>
      </div>

      {view === "list" ? (
        <Card>
          <CardContent className="pt-0 px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead className="hidden md:table-cell">Project</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Scheduled</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Agent</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointmentsList.map((apt) => (
                  <TableRow key={apt.id}>
                    <TableCell>
                      <div>
                        <p className="text-sm">{apt.clientName}</p>
                        <p className="text-xs text-muted-foreground">{apt.phone}</p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {apt.project}
                    </TableCell>
                    <TableCell>
                      <Badge className={typeStyles[apt.type]}>
                        <span className="flex items-center gap-1">
                          {apt.type === "site_visit" ? (
                            <MapPin className="w-3 h-3" />
                          ) : (
                            <PhoneForwarded className="w-3 h-3" />
                          )}
                          {apt.type === "site_visit" ? "Site Visit" : "Callback"}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <CalendarCheck className="w-3 h-3" />
                        {apt.scheduledAt}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusStyles[apt.status]}>
                        {apt.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <User className="w-3 h-3" />
                        {apt.assignedAgent}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-7 gap-1">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="text-center text-xs text-muted-foreground py-2">
                  {day}
                </div>
              ))}
              {Array.from({ length: 28 }, (_, i) => {
                const dayNum = i + 1;
                const dayAppts = appointmentsList.filter((a) => {
                  const d = new Date(a.scheduledAt).getDate();
                  return d === dayNum;
                });
                return (
                  <div
                    key={i}
                    className={`min-h-[80px] border border-border rounded-lg p-1.5 ${
                      dayNum === 28 ? "bg-primary/5 border-primary/30" : ""
                    }`}
                  >
                    <p className={`text-xs ${dayNum === 28 ? "text-primary" : "text-muted-foreground"}`}>
                      {dayNum}
                    </p>
                    {dayAppts.map((a) => (
                      <div
                        key={a.id}
                        className={`mt-1 text-[10px] px-1 py-0.5 rounded truncate ${
                          a.type === "site_visit"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-cyan-100 text-cyan-700"
                        }`}
                      >
                        {a.clientName}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Appointment Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Add Appointment</DialogTitle>
            <DialogDescription>
              Schedule a new site visit or callback.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Client Name *</Label>
                <Input
                  placeholder="e.g., Ahmed Khan"
                  value={form.clientName}
                  onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Phone *</Label>
                <Input
                  placeholder="+92 3XX XXXXXXX"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Project</Label>
                <Input
                  placeholder="e.g., DHA Islamabad Phase 5"
                  value={form.project}
                  onChange={(e) => setForm({ ...form, project: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="site_visit">Site Visit</SelectItem>
                    <SelectItem value="callback">Callback</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date *</Label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Time *</Label>
                <Input
                  type="time"
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Assigned Agent</Label>
              <Select value={form.assignedAgent} onValueChange={(v) => setForm({ ...form, assignedAgent: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select agent..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ali Agent">Ali Agent</SelectItem>
                  <SelectItem value="Sara Agent">Sara Agent</SelectItem>
                  <SelectItem value="Unassigned">Unassigned</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                placeholder="Any notes about this appointment..."
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd}>
              <Plus className="w-4 h-4" />
              Add Appointment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}