import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "./ui/select";
import {
  Building2, Phone, Clock, Bell, Users, Save, Plus, Mail, Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../auth";
import { useNavigate } from "react-router";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

export function SettingsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const [company, setCompany] = useState({
    companyName: "Realty Corp Pakistan",
    website: "https://realtycorp.pk",
    address: "Blue Area, Jinnah Avenue, Islamabad",
    callStart: "09:00",
    callEnd: "18:00",
  });

  // Notification preferences
  const [notifPrefs, setNotifPrefs] = useState([
    { id: "notifyNewLead", label: "Email on new lead generated", enabled: true },
    { id: "notifyAppointment", label: "Email on appointment booked", enabled: true },
    { id: "notifyCampaignDone", label: "Email on campaign completed", enabled: false },
    { id: "notifyDailySummary", label: "Daily summary report", enabled: true },
  ]);

  const toggleNotif = (id: string) => {
    setNotifPrefs((prev) =>
      prev.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p))
    );

    const next = notifPrefs.map((p) =>
      p.id === id ? { ...p, enabled: !p.enabled } : p
    );

    const payload: any = {};
    next.forEach((p) => {
      payload[p.id] = p.enabled;
    });

    const save = async () => {
      if (!user?.email) return;
      try {
        const res = await fetch("/api/settings/company", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-user-email": user.email,
          },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Failed to save notification preferences");
        }
      } catch (err: any) {
        console.error(err);
        toast.error(err.message || "Failed to save notification preferences");
      }
    };

    void save();

    const pref = notifPrefs.find((p) => p.id === id);
    if (pref) {
      toast.success(
        `${pref.label}: ${pref.enabled ? "Disabled" : "Enabled"}`
      );
    }
  };

  // Phone numbers
  const [phoneNumbers, setPhoneNumbers] = useState([
    { id: "1", number: "+92 51 1234567", label: "Primary VAPI Number", status: "Active" },
    { id: "2", number: "+92 51 7654321", label: "Secondary Number", status: "Inactive" },
  ]);

  const navigate = useNavigate();
  const [addNumberOpen, setAddNumberOpen] = useState(false);
  const [newNumber, setNewNumber] = useState({ number: "", label: "" });

  const handleAddNumber = () => {
    if (!newNumber.number) {
      toast.error("Phone number is required");
      return;
    }
    setPhoneNumbers((prev) => [
      ...prev,
      {
        id: String(prev.length + 1),
        number: newNumber.number,
        label: newNumber.label || "New Number",
        status: "Inactive",
      },
    ]);
    setNewNumber({ number: "", label: "" });
    setAddNumberOpen(false);
    toast.success("Phone number added successfully");
  };

  // Team members
  const [members, setMembers] = useState<
    { id: string; name: string; email: string; role: string }[]
  >([]);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({ name: "", email: "", role: "Agent" });
  const [deletingMemberId, setDeletingMemberId] = useState<string | null>(null);

  const handleInvite = () => {
    if (!inviteForm.email || !inviteForm.name) {
      toast.error("Name and email are required");
      return;
    }
    const invite = async () => {
      if (!user?.email) return;
      try {
        const res = await fetch("/api/settings/team-members", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-user-email": user.email,
          },
          body: JSON.stringify({
            name: inviteForm.name,
            inviteEmail: inviteForm.email,
            role: inviteForm.role,
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Failed to invite member");
        }
        const data = await res.json();
        setMembers((prev) => [...prev, data.member]);
        setInviteForm({ name: "", email: "", role: "Agent" });
        setInviteOpen(false);
        toast.success(`Invitation sent to ${inviteForm.email}`);
      } catch (err: any) {
        console.error(err);
        toast.error(err.message || "Failed to invite member");
      }
    };

    void invite();
  };

  useEffect(() => {
    const load = async () => {
      if (!user?.email) return;
      setLoading(true);
      try {
        const [companyRes, membersRes] = await Promise.all([
          fetch("/api/settings/company", {
            headers: { "x-user-email": user.email },
          }),
          fetch("/api/settings/team-members", {
            headers: { "x-user-email": user.email },
          }),
        ]);

        if (!companyRes.ok) {
          const data = await companyRes.json().catch(() => ({}));
          throw new Error(data.error || "Failed to load settings");
        }
        if (!membersRes.ok) {
          const data = await membersRes.json().catch(() => ({}));
          throw new Error(data.error || "Failed to load team members");
        }

        const companyJson = await companyRes.json();
        const membersJson = await membersRes.json();

        const s = companyJson.settings;
        if (s) {
          setCompany({
            companyName: s.companyName || "",
            website: s.website || "",
            address: s.address || "",
            callStart: s.callStart || "09:00",
            callEnd: s.callEnd || "18:00",
          });
          setNotifPrefs((prev) =>
            prev.map((p) => ({
              ...p,
              enabled: Boolean(s[p.id]),
            }))
          );
        }

        setMembers(membersJson.members ?? []);
      } catch (err: any) {
        console.error(err);
        toast.error(err.message || "Failed to load settings");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user?.email]);

  const saveCompanyProfile = () => {
    const save = async () => {
      if (!user?.email) return;
      try {
        const res = await fetch("/api/settings/company", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-user-email": user.email,
          },
          body: JSON.stringify({
            companyName: company.companyName,
            website: company.website,
            address: company.address,
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Failed to save company profile");
        }
        toast.success("Company profile saved");
      } catch (err: any) {
        console.error(err);
        toast.error(err.message || "Failed to save company profile");
      }
    };

    void save();
  };

  const saveHours = () => {
    const save = async () => {
      if (!user?.email) return;
      try {
        const res = await fetch("/api/settings/company", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-user-email": user.email,
          },
          body: JSON.stringify({
            callStart: company.callStart,
            callEnd: company.callEnd,
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Failed to save calling hours");
        }
        toast.success("Calling hours saved");
      } catch (err: any) {
        console.error(err);
        toast.error(err.message || "Failed to save calling hours");
      }
    };

    void save();
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1>Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your company profile and preferences.
        </p>
      </div>

      {/* Company Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Company Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground">Company Name</label>
              <input
                type="text"
                value={company.companyName}
                onChange={(e) =>
                  setCompany((prev) => ({ ...prev, companyName: e.target.value }))
                }
                className="w-full mt-1 border border-border rounded-lg px-3 py-2 text-sm bg-input-background"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Website</label>
              <input
                type="text"
                value={company.website}
                onChange={(e) =>
                  setCompany((prev) => ({ ...prev, website: e.target.value }))
                }
                className="w-full mt-1 border border-border rounded-lg px-3 py-2 text-sm bg-input-background"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm text-muted-foreground">Address</label>
              <input
                type="text"
                value={company.address}
                onChange={(e) =>
                  setCompany((prev) => ({ ...prev, address: e.target.value }))
                }
                className="w-full mt-1 border border-border rounded-lg px-3 py-2 text-sm bg-input-background"
              />
            </div>
          </div>
          <Button size="sm" className="mt-4" onClick={saveCompanyProfile}>
            <Save className="w-4 h-4" />
            Save Changes
          </Button>
        </CardContent>
      </Card>

      {/* Phone Numbers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            Phone Numbers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {phoneNumbers.map((phone) => (
              <div key={phone.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="text-sm">{phone.number}</p>
                  <p className="text-xs text-muted-foreground">{phone.label}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={phone.status === "Active" ? "bg-green-100 text-green-700 border-green-200" : "bg-gray-100 text-gray-600 border-gray-200"}>
                    {phone.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" size="sm" onClick={() => navigate("/dashboard/phone-numbers")}>
              Manage All Numbers
            </Button>
            <Button size="sm" onClick={() => navigate("/dashboard/phone-numbers")}>
              <Plus className="w-4 h-4" />
              Buy Number
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Business Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Default Calling Hours
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground">Start Time</label>
              <input
                type="time"
                value={company.callStart}
                onChange={(e) =>
                  setCompany((prev) => ({ ...prev, callStart: e.target.value }))
                }
                className="w-full mt-1 border border-border rounded-lg px-3 py-2 text-sm bg-input-background"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">End Time</label>
              <input
                type="time"
                value={company.callEnd}
                onChange={(e) =>
                  setCompany((prev) => ({ ...prev, callEnd: e.target.value }))
                }
                className="w-full mt-1 border border-border rounded-lg px-3 py-2 text-sm bg-input-background"
              />
            </div>
          </div>
          <Button size="sm" className="mt-4" onClick={saveHours}>
            <Save className="w-4 h-4" />
            Save Hours
          </Button>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notifPrefs.map((pref) => (
              <div key={pref.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{pref.label}</span>
                </div>
                <Switch
                  checked={pref.enabled}
                  onCheckedChange={() => toggleNotif(pref.id)}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Team Members */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Team Members
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-xs">
                    {member.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <p className="text-sm">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{member.role}</Badge>
                  <button
                    className="p-1.5 rounded-md hover:bg-accent"
                    onClick={() => setDeletingMemberId(member.id)}
                    title="Remove member"
                  >
                    <Trash2 className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => { setInviteForm({ name: "", email: "", role: "Agent" }); setInviteOpen(true); }}>
            <Plus className="w-4 h-4" />
            Invite Member
          </Button>
        </CardContent>
      </Card>

      {/* Add Number Dialog */}
      <Dialog open={addNumberOpen} onOpenChange={setAddNumberOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Phone Number</DialogTitle>
            <DialogDescription>
              Add a new VAPI phone number for calling campaigns.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Phone Number *</Label>
              <Input
                placeholder="+92 51 XXXXXXX"
                value={newNumber.number}
                onChange={(e) => setNewNumber({ ...newNumber, number: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Label</Label>
              <Input
                placeholder="e.g., Campaign Line 3"
                value={newNumber.label}
                onChange={(e) => setNewNumber({ ...newNumber, label: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddNumberOpen(false)}>Cancel</Button>
            <Button onClick={handleAddNumber}>
              <Plus className="w-4 h-4" />
              Add Number
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invite Member Dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>
              Send an invitation to join your Convaire workspace.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Full Name *</Label>
              <Input
                placeholder="e.g., Zain Ahmed"
                value={inviteForm.name}
                onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Email Address *</Label>
              <Input
                type="email"
                placeholder="e.g., zain@realtycorp.pk"
                value={inviteForm.email}
                onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={inviteForm.role} onValueChange={(v) => setInviteForm({ ...inviteForm, role: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Agent">Agent</SelectItem>
                  <SelectItem value="Viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteOpen(false)}>Cancel</Button>
            <Button onClick={handleInvite}>
              <Mail className="w-4 h-4" />
              Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Member Confirmation */}
      <AlertDialog
        open={!!deletingMemberId}
        onOpenChange={(open) => {
          if (!open) setDeletingMemberId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove team member?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the member from your workspace. It will not delete their user account or data in the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingMemberId(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (!deletingMemberId) return;
                const id = deletingMemberId;
                setDeletingMemberId(null);
                try {
                  const res = await fetch(`/api/settings/team-members/${id}`, {
                    method: "DELETE",
                  });
                  if (!res.ok) {
                    const data = await res.json().catch(() => ({}));
                    throw new Error(
                      data.error || "Failed to delete team member"
                    );
                  }
                  setMembers((prev) => prev.filter((m) => m.id !== id));
                  toast.success("Team member removed");
                } catch (err: any) {
                  console.error(err);
                  toast.error(err.message || "Failed to delete team member");
                }
              }}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}