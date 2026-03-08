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
  Loader2, Link2, Unlink, Download, ExternalLink, User,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../auth";
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
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);

  const [profile, setProfile] = useState({ name: "", email: "" });
  const [savingProfile, setSavingProfile] = useState(false);

  const [company, setCompany] = useState({
    companyName: "",
    website: "",
    address: "",
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
  const [savingNotif, setSavingNotif] = useState(false);

  const toggleNotif = async (id: string) => {
    const prevPref = notifPrefs.find((p) => p.id === id);
    if (!prevPref || savingNotif) return;

    const prevState = [...notifPrefs];
    const next = notifPrefs.map((p) =>
      p.id === id ? { ...p, enabled: !p.enabled } : p
    );
    setNotifPrefs(next);

    const payload: Record<string, boolean> = {};
    next.forEach((p) => {
      payload[p.id] = p.enabled;
    });

    setSavingNotif(true);
    try {
      const res = await fetch("/api/settings/company", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save");
      }
      toast.success(
        `${prevPref.label}: ${!prevPref.enabled ? "Enabled" : "Disabled"}`
      );
    } catch (err: unknown) {
      setNotifPrefs(prevState);
      toast.error(err instanceof Error ? err.message : "Failed to save notification preferences");
    } finally {
      setSavingNotif(false);
    }
  };

  // Twilio & phone numbers
  const [twilioConnected, setTwilioConnected] = useState(false);
  const [twilioAccountSidMasked, setTwilioAccountSidMasked] = useState<string | null>(null);
  const [connectForm, setConnectForm] = useState({ accountSid: "", authToken: "" });
  const [connecting, setConnecting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [disconnectConfirmOpen, setDisconnectConfirmOpen] = useState(false);
  const [phoneNumbers, setPhoneNumbers] = useState<
    { id: string; phoneNumber: string; label: string | null; capabilities?: Record<string, boolean> }[]
  >([]);
  const [editingLabelId, setEditingLabelId] = useState<string | null>(null);
  const [editingLabelValue, setEditingLabelValue] = useState("");
  const [removingNumberId, setRemovingNumberId] = useState<string | null>(null);
  const [removingNumber, setRemovingNumber] = useState(false);

  const loadTwilioStatus = async () => {
    if (!user?.email) return;
    try {
      const res = await fetch("/api/settings/twilio/status", {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setTwilioConnected(data.connected);
        setTwilioAccountSidMasked(data.accountSidMasked ?? null);
      }
    } catch {
      // ignore
    }
  };

  const loadPhoneNumbers = async () => {
    if (!user?.email) return;
    try {
      const res = await fetch("/api/settings/phone-numbers", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setPhoneNumbers(data.phoneNumbers ?? []);
      }
    } catch {
      // ignore
    }
  };

  const handleConnect = async () => {
    if (!connectForm.accountSid.trim() || !connectForm.authToken.trim()) {
      toast.error("Account SID and Auth Token are required");
      return;
    }
    setConnecting(true);
    try {
      const res = await fetch("/api/settings/twilio/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          accountSid: connectForm.accountSid.trim(),
          authToken: connectForm.authToken.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Failed to connect");
      }
      setTwilioConnected(true);
      setTwilioAccountSidMasked(data.accountSidMasked ?? null);
      setConnectForm({ accountSid: "", authToken: "" });
      toast.success("Twilio account connected");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to connect");
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    setDisconnecting(true);
    try {
      const res = await fetch("/api/settings/twilio/disconnect", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to disconnect");
      }
      setTwilioConnected(false);
      setTwilioAccountSidMasked(null);
      setPhoneNumbers([]);
      setDisconnectConfirmOpen(false);
      toast.success("Twilio account disconnected");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to disconnect");
    } finally {
      setDisconnecting(false);
    }
  };

  const handleImport = async () => {
    setImporting(true);
    try {
      const res = await fetch("/api/settings/twilio/import", {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Failed to import");
      }
      await loadPhoneNumbers();
      toast.success(data.message ?? `${data.imported} numbers imported`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to import");
    } finally {
      setImporting(false);
    }
  };

  const handleRemoveNumber = async (id: string) => {
    setRemovingNumber(true);
    try {
      const res = await fetch(`/api/settings/phone-numbers/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to remove");
      }
      setPhoneNumbers((prev) => prev.filter((p) => p.id !== id));
      setRemovingNumberId(null);
      toast.success("Number removed");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to remove");
    } finally {
      setRemovingNumber(false);
    }
  };

  const handleUpdateLabel = async (id: string, label: string) => {
    setEditingLabelId(null);
    try {
      const res = await fetch("/api/settings/phone-numbers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id, label: label || null }),
      });
      if (!res.ok) {
        throw new Error("Failed to update label");
      }
      setPhoneNumbers((prev) =>
        prev.map((p) => (p.id === id ? { ...p, label: label || null } : p))
      );
    } catch {
      toast.error("Failed to update label");
    }
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
      setInviting(true);
      try {
        const res = await fetch("/api/settings/team-members", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
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
      } finally {
        setInviting(false);
      }
    };

    void invite();
  };

  useEffect(() => {
    const load = async () => {
      if (!user?.email) return;
      setLoading(true);
      try {
        const [profileRes, companyRes, membersRes, twilioStatusRes, phoneNumbersRes] = await Promise.all([
          fetch("/api/settings/profile", { credentials: "include" }),
          fetch("/api/settings/company", { credentials: "include" }),
          fetch("/api/settings/team-members", { credentials: "include" }),
          fetch("/api/settings/twilio/status", { credentials: "include" }),
          fetch("/api/settings/phone-numbers", { credentials: "include" }),
        ]);

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          if (profileData.profile) {
            setProfile({
              name: profileData.profile.name ?? "",
              email: profileData.profile.email ?? "",
            });
          } else if (user) {
            setProfile({ name: user.name ?? "", email: user.email ?? "" });
          }
        } else if (user) {
          setProfile({ name: user.name ?? "", email: user.email ?? "" });
        }

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

        if (twilioStatusRes.ok) {
          const twilioData = await twilioStatusRes.json();
          setTwilioConnected(twilioData.connected);
          setTwilioAccountSidMasked(twilioData.accountSidMasked ?? null);
        }
        if (phoneNumbersRes.ok) {
          const phoneData = await phoneNumbersRes.json();
          setPhoneNumbers(phoneData.phoneNumbers ?? []);
        }

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

  useEffect(() => {
    if (user && !profile.email) {
      setProfile({ name: user.name ?? "", email: user.email ?? "" });
    }
  }, [user?.email, user?.name]);

  const [savingCompanyProfile, setSavingCompanyProfile] = useState(false);
  const [savingHours, setSavingHours] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [deletingMember, setDeletingMember] = useState(false);

  const saveProfile = async () => {
    if (!user?.email) return;
    const trimmedEmail = profile.email.trim().toLowerCase();
    const trimmedName = profile.name.trim();
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }
    setSavingProfile(true);
    try {
      const res = await fetch("/api/settings/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: trimmedEmail,
          name: trimmedName || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile");
      }
      updateProfile({ email: data.profile?.email ?? trimmedEmail, name: data.profile?.name ?? trimmedName });
      setProfile({ name: data.profile?.name ?? trimmedName, email: data.profile?.email ?? trimmedEmail });
      toast.success("Profile updated");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const saveCompanyProfile = () => {
    const save = async () => {
      if (!user?.email) return;
      setSavingCompanyProfile(true);
      try {
        const res = await fetch("/api/settings/company", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
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
      } finally {
        setSavingCompanyProfile(false);
      }
    };

    void save();
  };

  const saveHours = () => {
    const save = async () => {
      if (!user?.email) return;
      setSavingHours(true);
      try {
        const res = await fetch("/api/settings/company", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
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
      } finally {
        setSavingHours(false);
      }
    };

    void save();
  };

  return (
    <div className="space-y-6 w-full">
      <div>
        <h1>Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your company profile and preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left: all blocks except Phone Numbers */}
        <div className="space-y-6">
        {/* Company Profile */}
        <Card>
          <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Company Profile
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Your business information used across campaigns and communications.
          </p>
          </CardHeader>
          <CardContent>
            {loading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-10 bg-muted rounded-lg" />
              <div className="h-10 bg-muted rounded-lg" />
              <div className="h-10 bg-muted rounded-lg" />
            </div>
            ) : (
              <>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Company Name</Label>
                    <Input
                      placeholder="e.g., Acme Realty"
                      value={company.companyName}
                      onChange={(e) =>
                        setCompany((prev) => ({ ...prev, companyName: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Website</Label>
                    <Input
                      type="url"
                      placeholder="https://example.com"
                      value={company.website}
                      onChange={(e) =>
                        setCompany((prev) => ({ ...prev, website: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Address</Label>
                    <Input
                      placeholder="e.g., 123 Main St, City, Country"
                      value={company.address}
                      onChange={(e) =>
                        setCompany((prev) => ({ ...prev, address: e.target.value }))
                      }
                    />
                  </div>
                </div>
                <Button size="sm" className="mt-4 gap-2" onClick={saveCompanyProfile} disabled={savingCompanyProfile}>
                {savingCompanyProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Right: Account */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Account
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Your login email and display name. Changing your email will update your sign-in credentials.
            </p>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-10 bg-muted rounded-lg" />
                <div className="h-10 bg-muted rounded-lg" />
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      placeholder="e.g., John Smith"
                      value={profile.name}
                      onChange={(e) =>
                        setProfile((prev) => ({ ...prev, name: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email Address</Label>
                    <Input
                      type="email"
                      placeholder="you@company.com"
                      value={profile.email}
                      onChange={(e) =>
                        setProfile((prev) => ({ ...prev, email: e.target.value }))
                      }
                    />
                  </div>
                </div>
                <Button size="sm" className="mt-4 gap-2" onClick={saveProfile} disabled={savingProfile}>
                  {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Changes
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Default Calling Hours */}
        <Card>
          <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Default Calling Hours
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Set when campaigns are allowed to make outbound calls. Calls outside these hours will be queued.
          </p>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex gap-4 animate-pulse">
                <div className="flex-1 h-10 bg-muted rounded-lg" />
                <div className="flex-1 h-10 bg-muted rounded-lg" />
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Start Time</Label>
                    <Input
                      type="time"
                      value={company.callStart}
                      onChange={(e) =>
                        setCompany((prev) => ({ ...prev, callStart: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Time</Label>
                    <Input
                      type="time"
                      value={company.callEnd}
                      onChange={(e) =>
                        setCompany((prev) => ({ ...prev, callEnd: e.target.value }))
                      }
                    />
                  </div>
                </div>
                <Button size="sm" className="mt-4 gap-2" onClick={saveHours} disabled={savingHours}>
                  {savingHours ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Hours
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notification Preferences
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Choose which email notifications you want to receive.
          </p>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4 animate-pulse">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="h-4 w-48 bg-muted rounded" />
                  <div className="h-6 w-10 bg-muted rounded" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {notifPrefs.map((pref) => (
                <div key={pref.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="text-sm">{pref.label}</span>
                  </div>
                  <Switch
                    checked={pref.enabled}
                    onCheckedChange={() => toggleNotif(pref.id)}
                    disabled={savingNotif}
                  />
                </div>
              ))}
            </div>
          )}
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
        </div>

        {/* Right: Phone Numbers (sticky) */}
        <div className="lg:sticky lg:top-6 lg:self-start">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            Phone Numbers
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!twilioConnected ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Connect your Twilio account to import phone numbers for calling campaigns.
              </p>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Account SID</Label>
                  <Input
                    placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    value={connectForm.accountSid}
                    onChange={(e) =>
                      setConnectForm((prev) => ({ ...prev, accountSid: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Auth Token</Label>
                  <Input
                    type="password"
                    placeholder="Your Twilio Auth Token"
                    value={connectForm.authToken}
                    onChange={(e) =>
                      setConnectForm((prev) => ({ ...prev, authToken: e.target.value }))
                    }
                  />
                </div>
                <a
                  href="https://console.twilio.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-muted-foreground hover:underline flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  Get credentials from Twilio Console
                </a>
              </div>
              <Button onClick={handleConnect} disabled={connecting} className="gap-2">
                {connecting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Link2 className="w-4 h-4" />
                )}
                Connect Twilio
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-700 border-green-200">
                    Connected
                  </Badge>
                  {twilioAccountSidMasked && (
                    <span className="text-xs text-muted-foreground font-mono">
                      {twilioAccountSidMasked}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDisconnectConfirmOpen(true)}
                    disabled={disconnecting}
                    className="gap-2"
                  >
                    {disconnecting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Unlink className="w-4 h-4" />
                    )}
                    Disconnect
                  </Button>
                  <Button size="sm" onClick={handleImport} disabled={importing} className="gap-2">
                    {importing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    Import from Twilio
                  </Button>
                </div>
              </div>
              <div className="space-y-3">
                {phoneNumbers.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4">
                    No numbers imported. Click Import from Twilio to fetch your phone numbers.
                  </p>
                ) : (
                  phoneNumbers.map((phone) => (
                    <div
                      key={phone.id}
                      className="flex items-center justify-between py-2 border-b border-border last:border-0"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{phone.phoneNumber}</p>
                        {editingLabelId === phone.id ? (
                          <Input
                            className="mt-1 h-7 text-xs"
                            value={editingLabelValue}
                            onChange={(e) => setEditingLabelValue(e.target.value)}
                            onBlur={() => {
                              handleUpdateLabel(phone.id, editingLabelValue);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleUpdateLabel(phone.id, editingLabelValue);
                              }
                            }}
                            autoFocus
                          />
                        ) : (
                          <p
                            className="text-xs text-muted-foreground cursor-pointer hover:text-foreground"
                            onClick={() => {
                              setEditingLabelId(phone.id);
                              setEditingLabelValue(phone.label ?? "");
                            }}
                          >
                            {phone.label || "Click to add label"}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge className="bg-green-100 text-green-700 border-green-200">
                          Active
                        </Badge>
                        <button
                          className="p-1.5 rounded-md hover:bg-accent text-muted-foreground"
                          onClick={() => setRemovingNumberId(phone.id)}
                          title="Remove number"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
        </div>
      </div>

      {/* Disconnect Twilio Confirmation */}
      <AlertDialog
        open={disconnectConfirmOpen}
        onOpenChange={(open) => {
          if (!open) setDisconnectConfirmOpen(false);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect Twilio?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove your Twilio connection and all imported phone numbers. You can reconnect anytime.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDisconnectConfirmOpen(false)} disabled={disconnecting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={disconnecting}
              onClick={handleDisconnect}
            >
              Disconnect
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Remove Number Confirmation */}
      <AlertDialog
        open={!!removingNumberId}
        onOpenChange={(open) => {
          if (!open) setRemovingNumberId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove phone number?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the number from your list. It will not affect your Twilio account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRemovingNumberId(null)} disabled={removingNumber}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={removingNumber}
              onClick={() => {
                if (removingNumberId) {
                  handleRemoveNumber(removingNumberId);
                }
              }}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
            <Button variant="outline" onClick={() => setInviteOpen(false)} disabled={inviting}>Cancel</Button>
            <Button onClick={handleInvite} disabled={inviting} className="gap-2">
              {inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
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
              disabled={deletingMember}
              onClick={async () => {
                if (!deletingMemberId) return;
                const id = deletingMemberId;
                setDeletingMember(true);
                try {
                  const res = await fetch(`/api/settings/team-members/${id}`, {
                    method: "DELETE",
                    credentials: "include",
                  });
                  if (!res.ok) {
                    const data = await res.json().catch(() => ({}));
                    throw new Error(
                      data.error || "Failed to delete team member"
                    );
                  }
                  setMembers((prev) => prev.filter((m) => m.id !== id));
                  setDeletingMemberId(null);
                  toast.success("Team member removed");
                } catch (err: any) {
                  console.error(err);
                  toast.error(err.message || "Failed to delete team member");
                } finally {
                  setDeletingMember(false);
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