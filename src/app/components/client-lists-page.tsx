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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  ListChecks, Plus, Users, Pencil, Trash2, FolderOpen, Search, X, Phone, MapPin,
  UserPlus, UserMinus, CheckCircle2, Loader2,
} from "lucide-react";
import { useAuth } from "../auth";
import { toast } from "sonner";

const statusStyles: Record<string, string> = {
  active: "bg-green-100 text-green-700 border-green-200",
  inactive: "bg-gray-100 text-gray-600 border-gray-200",
  do_not_call: "bg-red-100 text-red-700 border-red-200",
};

type ClientStatus = "active" | "inactive" | "do_not_call";

type Client = {
  id: string;
  name: string;
  phone: string;
  location: string;
  tags: string[];
  status: ClientStatus;
};

type ClientList = {
  id: string;
  name: string;
  description?: string | null;
  campaigns: number;
  createdAt: string;
};

export function ClientListsPage() {
  const { user } = useAuth();
  const [lists, setLists] = useState<ClientList[]>([]);
  const [membership, setMembership] = useState<Record<string, string[]>>({});
  const [allClients, setAllClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingList, setEditingList] = useState<ClientList | null>(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const [memberSearch, setMemberSearch] = useState("");
  const [addClientSearch, setAddClientSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<ClientList | null>(null);

  const getMembers = (listId: string) => {
    const ids = membership[listId] || [];
    return allClients.filter((c) => ids.includes(c.id));
  };

  const getNonMembers = (listId: string) => {
    const ids = membership[listId] || [];
    return allClients.filter((c) => !ids.includes(c.id));
  };

  useEffect(() => {
    const load = async () => {
      if (!user?.email) return;
      setLoading(true);
      try {
        const [listsRes, clientsRes] = await Promise.all([
          fetch("/api/client-lists", {
            headers: { "x-user-email": user.email },
          }),
          fetch("/api/clients", {
            headers: { "x-user-email": user.email },
          }),
        ]);

        if (!listsRes.ok) throw new Error("Failed to load lists");
        if (!clientsRes.ok) throw new Error("Failed to load clients");

        const listsJson = await listsRes.json();
        const clientsJson = await clientsRes.json();

        const mappedLists: ClientList[] = (listsJson.lists ?? []).map((l: any) => ({
          id: l.id,
          name: l.name,
          description: l.description,
          campaigns: l.campaigns ?? 0,
          createdAt: l.createdAt?.split("T")[0] ?? "",
        }));
        setLists(mappedLists);

        const membershipMap: Record<string, string[]> = {};
        for (const l of listsJson.lists ?? []) {
          membershipMap[l.id] = l.memberIds ?? [];
        }
        setMembership(membershipMap);

        const mappedClients: Client[] = (clientsJson.clients ?? []).map((c: any) => ({
          id: c.id,
          name: c.name,
          phone: c.phone,
          location: c.location ?? "N/A",
          tags: c.tags ? String(c.tags).split(",").map((t: string) => t.trim()).filter(Boolean) : [],
          status: c.status as ClientStatus,
        }));
        setAllClients(mappedClients);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load client lists from server");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user?.email]);

  const handleCreate = () => {
    if (!form.name) {
      toast.error("List name is required");
      return;
    }
    const create = async () => {
      if (!user?.email) return;
      try {
        const res = await fetch("/api/client-lists", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-user-email": user.email,
          },
          body: JSON.stringify({
            name: form.name,
            description: form.description,
          }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Failed to create list");
        }

        const data = await res.json();
        const list = data.list;
        const newList: ClientList = {
          id: list.id,
          name: list.name,
          description: list.description,
          campaigns: list.campaigns ?? 0,
          createdAt: list.createdAt?.split("T")[0] ?? "",
        };

        setLists((prev) => [newList, ...prev]);
        setMembership((prev) => ({ ...prev, [newList.id]: [] }));
        setForm({ name: "", description: "" });
        setCreateOpen(false);
        toast.success(`List "${newList.name}" created successfully`);
      } catch (err: any) {
        console.error(err);
        toast.error(err.message || "Failed to create list");
      }
    };

    void create();
  };

  const handleEdit = () => {
    if (!editingList || !form.name) return;

    const update = async () => {
      try {
        const res = await fetch(`/api/client-lists/${editingList.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            description: form.description,
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Failed to update list");
        }
        setLists((prev) =>
          prev.map((l) =>
            l.id === editingList.id
              ? { ...l, name: form.name, description: form.description }
              : l
          )
        );
        setEditOpen(false);
        setEditingList(null);
        toast.success("List updated successfully");
      } catch (err: any) {
        console.error(err);
        toast.error(err.message || "Failed to update list");
      }
    };

    void update();
  };

  const openEdit = (list: ClientList) => {
    setEditingList(list);
    setForm({ name: list.name, description: list.description ?? "" });
    setMemberSearch("");
    setAddClientSearch("");
    setEditOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    const remove = async () => {
      try {
        const res = await fetch(`/api/client-lists/${id}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Failed to delete list");
        }
        setLists((prev) => prev.filter((l) => l.id !== id));
        setMembership((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
        toast.success(`List "${name}" deleted`);
      } catch (err: any) {
        console.error(err);
        toast.error(err.message || "Failed to delete list");
      }
    };

    void remove();
  };

  const addClientToList = (listId: string, clientId: string, clientName: string) => {
    const add = async () => {
      try {
        const res = await fetch(`/api/client-lists/${listId}/members`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ clientId }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Failed to add client to list");
        }
        setMembership((prev) => ({
          ...prev,
          [listId]: [...(prev[listId] || []), clientId],
        }));
        toast.success(`${clientName} added to list`);
      } catch (err: any) {
        console.error(err);
        toast.error(err.message || "Failed to add client to list");
      }
    };

    void add();
  };

  const removeClientFromList = (listId: string, clientId: string, clientName: string) => {
    const remove = async () => {
      try {
        const res = await fetch(
          `/api/client-lists/${listId}/members?clientId=${encodeURIComponent(
            clientId
          )}`,
          { method: "DELETE" }
        );
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Failed to remove client from list");
        }
        setMembership((prev) => ({
          ...prev,
          [listId]: (prev[listId] || []).filter((id) => id !== clientId),
        }));
        toast.success(`${clientName} removed from list`);
      } catch (err: any) {
        console.error(err);
        toast.error(err.message || "Failed to remove client from list");
      }
    };

    void remove();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1>Client Lists</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Organize clients into named groups for campaigns.
          </p>
        </div>
        <Button size="sm" onClick={() => { setForm({ name: "", description: "" }); setCreateOpen(true); }}>
          <Plus className="w-4 h-4" />
          Create List
        </Button>
      </div>

      {/* Grid of lists */}
      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          <span className="text-sm text-muted-foreground">
            Loading client lists...
          </span>
        </div>
      ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {lists.map((list) => {
          const memberCount = (membership[list.id] || []).length;
          return (
            <Card key={list.id} className="hover:border-primary/30 transition-colors">
              <CardContent className="pt-5 pb-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <FolderOpen className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm">{list.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Created {list.createdAt}
                      </p>
                    </div>
                  </div>
                </div>

                {list.description && (
                  <p className="text-xs text-muted-foreground mt-3 line-clamp-2">
                    {list.description}
                  </p>
                )}

                <div className="mt-3 flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Users className="w-3.5 h-3.5" />
                    <span>{memberCount} clients</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <ListChecks className="w-3.5 h-3.5" />
                    <span>{list.campaigns} campaigns</span>
                  </div>
                </div>

                <div className="mt-3 flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => openEdit(list)}>
                    <Pencil className="w-3 h-3" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setDeleteTarget(list)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      )}

      {/* Create List Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New List</DialogTitle>
            <DialogDescription>
              Create a new client list to organize contacts for campaigns.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>List Name *</Label>
              <Input
                placeholder="e.g., DHA Phase 5 Investors"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Brief description of this client list..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate}>
              <Plus className="w-4 h-4" />
              Create List
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit List Dialog (with client members) */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[680px] max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-blue-600" />
              Edit List — {editingList?.name}
            </DialogTitle>
            <DialogDescription>
              Update list details and manage client members.
            </DialogDescription>
          </DialogHeader>

          {editingList && (
            <Tabs defaultValue="members" className="flex-1 min-h-0">
              <TabsList className="w-full">
                <TabsTrigger value="members" className="flex-1">
                  <Users className="w-3.5 h-3.5 mr-1.5" />
                  Members ({(membership[editingList.id] || []).length})
                </TabsTrigger>
                <TabsTrigger value="add" className="flex-1">
                  <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                  Add Clients
                </TabsTrigger>
                <TabsTrigger value="details" className="flex-1">
                  <Pencil className="w-3.5 h-3.5 mr-1.5" />
                  Details
                </TabsTrigger>
              </TabsList>

              {/* Members Tab */}
              <TabsContent value="members" className="mt-4 max-h-[380px] overflow-y-auto">
                {(membership[editingList.id] || []).length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">
                    <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No clients in this list yet.</p>
                    <p className="text-xs mt-1">Switch to the "Add Clients" tab to add members.</p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 border border-border rounded-lg px-3 py-2 mb-3">
                      <Search className="w-4 h-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Search members..."
                        className="bg-transparent outline-none text-sm w-full"
                        value={memberSearch}
                        onChange={(e) => setMemberSearch(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      {getMembers(editingList.id)
                        .filter((c) =>
                          c.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
                          c.phone.includes(memberSearch)
                        )
                        .map((client) => (
                          <div
                            key={client.id}
                            className="flex items-center justify-between p-2.5 rounded-lg hover:bg-accent/50 transition-colors group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-xs">
                                {client.name.split(" ").map((n) => n[0]).join("")}
                              </div>
                              <div>
                                <p className="text-sm">{client.name}</p>
                                <div className="flex items-center gap-3 mt-0.5">
                                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Phone className="w-2.5 h-2.5" />
                                    {client.phone}
                                  </span>
                                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <MapPin className="w-2.5 h-2.5" />
                                    {client.location}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={`${statusStyles[client.status]} text-[10px] px-1.5 py-0`}>
                                {client.status.replace("_", " ")}
                              </Badge>
                              <button
                                onClick={() => removeClientFromList(editingList.id, client.id, client.name)}
                                className="p-1.5 rounded-md hover:bg-red-100 text-muted-foreground hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                                title="Remove from list"
                              >
                                <UserMinus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </>
                )}
              </TabsContent>

              {/* Add Clients Tab */}
              <TabsContent value="add" className="mt-4 max-h-[380px] overflow-y-auto">
                {getNonMembers(editingList.id).length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">
                    <CheckCircle2 className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">All clients are already in this list.</p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 border border-border rounded-lg px-3 py-2 mb-3">
                      <Search className="w-4 h-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Search clients to add..."
                        className="bg-transparent outline-none text-sm w-full"
                        value={addClientSearch}
                        onChange={(e) => setAddClientSearch(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      {getNonMembers(editingList.id)
                        .filter((c) =>
                          c.name.toLowerCase().includes(addClientSearch.toLowerCase()) ||
                          c.phone.includes(addClientSearch)
                        )
                        .map((client) => (
                          <div
                            key={client.id}
                            className="flex items-center justify-between p-2.5 rounded-lg hover:bg-accent/50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-xs">
                                {client.name.split(" ").map((n) => n[0]).join("")}
                              </div>
                              <div>
                                <p className="text-sm">{client.name}</p>
                                <div className="flex items-center gap-3 mt-0.5">
                                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Phone className="w-2.5 h-2.5" />
                                    {client.phone}
                                  </span>
                                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <MapPin className="w-2.5 h-2.5" />
                                    {client.location}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => addClientToList(editingList.id, client.id, client.name)}
                            >
                              <Plus className="w-3 h-3" />
                              Add
                            </Button>
                          </div>
                        ))}
                    </div>
                  </>
                )}
              </TabsContent>

              {/* Details Tab */}
              <TabsContent value="details" className="mt-4 space-y-4">
                <div className="space-y-2">
                  <Label>List Name *</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-accent/50 rounded-lg p-3 text-center">
                    <p className="text-lg">{(membership[editingList.id] || []).length}</p>
                    <p className="text-xs text-muted-foreground">Clients</p>
                  </div>
                  <div className="bg-accent/50 rounded-lg p-3 text-center">
                    <p className="text-lg">{editingList.campaigns}</p>
                    <p className="text-xs text-muted-foreground">Campaigns</p>
                  </div>
                </div>
                <Button onClick={handleEdit} className="w-full">
                  Save Changes
                </Button>
              </TabsContent>
            </Tabs>
          )}

          <DialogFooter className="mt-2">
            <Button variant="outline" onClick={() => setEditOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete List Confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete list {deleteTarget?.name}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this client list. Clients will remain in your database, but they will no longer be grouped in this list. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteTarget(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteTarget) {
                  handleDelete(deleteTarget.id, deleteTarget.name);
                }
                setDeleteTarget(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
