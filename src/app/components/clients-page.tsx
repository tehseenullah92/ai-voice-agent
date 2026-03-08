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
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuSub,
  DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "./ui/select";
import {
  Users, Plus, Upload, Download, Search, MoreHorizontal, Phone, MapPin,
  FileUp, Eye, Pencil, Trash2, ListChecks, Ban, CheckCircle2, UserX, Loader2,
} from "lucide-react";
import { useAuth } from "../auth";
import { toast } from "sonner";

type ClientStatus = "active" | "inactive" | "do_not_call";

type ClientType = {
  id: string;
  name: string;
  phone: string;
  location: string;
  tags: string[];
  status: ClientStatus;
  source: string;
  createdAt: string;
};

const statusStyles: Record<string, string> = {
  active: "bg-green-100 text-green-700 border-green-200",
  inactive: "bg-gray-100 text-gray-600 border-gray-200",
  do_not_call: "bg-red-100 text-red-700 border-red-200",
};

type ClientList = {
  id: string;
  name: string;
};

export function ClientsPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [clientsList, setClientsList] = useState<ClientType[]>([]);
  const [membership, setMembership] = useState<Record<string, string[]>>({});
  const [clientLists, setClientLists] = useState<ClientList[]>([]);
  const [loading, setLoading] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientType | null>(null);
  const [deleteClient, setDeleteClient] = useState<ClientType | null>(null);

  // Add client form state
  const [newClient, setNewClient] = useState({
    name: "", phone: "", location: "", tags: "", status: "active", source: "Manual", notes: "",
  });

  // Edit client form state
  const [editClient, setEditClient] = useState({
    name: "", phone: "", location: "", tags: "", status: "active", source: "Manual",
  });
  const [adding, setAdding] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!user?.email) return;
      setLoading(true);
      try {
        const [clientsRes, listsRes] = await Promise.all([
          fetch("/api/clients", {
            headers: { "x-user-email": user.email },
          }),
          fetch("/api/client-lists", {
            headers: { "x-user-email": user.email },
          }),
        ]);

        if (!clientsRes.ok) {
          throw new Error("Failed to load clients");
        }
        if (!listsRes.ok) {
          throw new Error("Failed to load client lists");
        }

        const clientsJson = await clientsRes.json();
        const listsJson = await listsRes.json();

        const mappedClients: ClientType[] = (clientsJson.clients ?? []).map(
          (c: any) => ({
            id: c.id,
            name: c.name,
            phone: c.phone,
            location: c.location ?? "N/A",
            tags: c.tags ? String(c.tags).split(",").map((t: string) => t.trim()).filter(Boolean) : [],
            status: c.status as ClientStatus,
            source: c.source ?? "Manual",
            createdAt: c.createdAt?.split("T")[0] ?? "",
          })
        );

        setClientsList(mappedClients);

        const lists: ClientList[] = (listsJson.lists ?? []).map((l: any) => ({
          id: l.id,
          name: l.name,
        }));
        setClientLists(lists);

        const membershipMap: Record<string, string[]> = {};
        for (const l of listsJson.lists ?? []) {
          membershipMap[l.id] = l.memberIds ?? [];
        }
        setMembership(membershipMap);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load clients from server");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user?.email]);

  const filtered = clientsList.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery);
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddClient = () => {
    if (!newClient.name || !newClient.phone) {
      toast.error("Name and Phone are required");
      return;
    }
    const client = {
      id: String(Date.now()),
      name: newClient.name,
      phone: newClient.phone,
      location: newClient.location || "N/A",
      tags: newClient.tags ? newClient.tags.split(",").map((t) => t.trim()) : [],
      status: newClient.status as "active" | "inactive" | "do_not_call",
      source: newClient.source,
      createdAt: new Date().toISOString().split("T")[0],
    };
    const doCreate = async () => {
      if (!user?.email) return;
      setAdding(true);
      try {
        const res = await fetch("/api/clients", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-user-email": user.email,
          },
          body: JSON.stringify({
            name: newClient.name,
            phone: newClient.phone,
            location: newClient.location,
            tags: newClient.tags,
            status: newClient.status,
            source: newClient.source,
            notes: newClient.notes,
          }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Failed to create client");
        }

        const data = await res.json();
        const created = data.client;
        const mapped: ClientType = {
          id: created.id,
          name: created.name, // Keeping 'name' as per ClientType
          phone: created.phone,
          location: created.location ?? "N/A",
          tags: created.tags
            ? String(created.tags).split(",").map((t: string) => t.trim()).filter(Boolean)
            : [],
          status: created.status as ClientStatus, // Keeping 'status' as per ClientType
          source: created.source ?? "Manual",
          createdAt: created.createdAt?.split("T")[0] ?? "",
        };

        setClientsList((prev) => [mapped, ...prev]);
        setNewClient({
          name: "",
          phone: "",
          location: "",
          tags: "",
          status: "active",
          source: "Manual",
          notes: "",
        });
        setAddOpen(false);
        toast.success(`Client "${mapped.name}" added successfully`);
      } catch (err: any) {
        console.error(err);
        toast.error(err.message || "Failed to create client");
      } finally {
        setAdding(false);
      }
    };

    void doCreate();
  };

  const handleEditClient = () => {
    if (!selectedClient || !editClient.name || !editClient.phone) {
      toast.error("Name and Phone are required");
      return;
    }
    const doUpdate = async () => {
      setUpdating(true);
      try {
        const res = await fetch(`/api/clients/${selectedClient.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: editClient.name,
            phone: editClient.phone,
            location: editClient.location,
            tags: editClient.tags,
            status: editClient.status,
            source: editClient.source,
          }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Failed to update client");
        }

        const data = await res.json();
        const updated = data.client;

        setClientsList((prev) =>
          prev.map((c) =>
            c.id === selectedClient.id
              ? {
                ...c,
                name: updated.name,
                phone: updated.phone,
                location: updated.location ?? "N/A",
                tags: updated.tags
                  ? String(updated.tags)
                    .split(",")
                    .map((t: string) => t.trim())
                    .filter(Boolean)
                  : [],
                status: updated.status as ClientStatus,
                source: updated.source ?? "Manual",
              }
              : c
          )
        );
        setEditOpen(false);
        toast.success(`Client "${updated.name}" updated`);
      } catch (err: any) {
        console.error(err);
        toast.error(err.message || "Failed to update client");
      } finally {
        setUpdating(false);
      }
    };

    void doUpdate();
  };

  const openView = (client: ClientType) => {
    setSelectedClient(client);
    setViewOpen(true);
  };

  const openEdit = (client: ClientType) => {
    setSelectedClient(client);
    setEditClient({
      name: client.name,
      phone: client.phone,
      location: client.location,
      tags: client.tags.join(", "),
      status: client.status,
      source: client.source,
    });
    setEditOpen(true);
  };

  const handleDelete = (client: ClientType) => {
    const doDelete = async () => {
      setDeleting(true);
      try {
        const res = await fetch(`/api/clients/${client.id}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Failed to delete client");
        }
        setClientsList((prev) => prev.filter((c) => c.id !== client.id));
        setDeleteClient(null);
        toast.success(`Client "${client.name}" deleted`);
      } catch (err: any) {
        console.error(err);
        toast.error(err.message || "Failed to delete client");
      } finally {
        setDeleting(false);
      }
    };

    void doDelete();
  };

  const changeStatus = (client: ClientType, newStatus: string) => {
    const doChange = async () => {
      try {
        const res = await fetch(`/api/clients/${client.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Failed to update status");
        }
        setClientsList((prev) =>
          prev.map((c) =>
            c.id === client.id ? { ...c, status: newStatus as ClientStatus } : c
          )
        );
        toast.success(
          `${client.name} status changed to ${newStatus.replace("_", " ")}`
        );
      } catch (err: any) {
        console.error(err);
        toast.error(err.message || "Failed to update status");
      }
    };

    void doChange();
  };

  const addToList = (client: ClientType, listId: string, listName: string) => {
    setMembership((prev) => {
      const current = prev[listId] || [];
      if (current.includes(client.id)) {
        toast.info(`${client.name} is already in "${listName}"`);
        return prev;
      }
      return prev;
    });

    const doAdd = async () => {
      try {
        const res = await fetch(`/api/client-lists/${listId}/members`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ clientId: client.id }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Failed to add to list");
        }
        setMembership((prev) => {
          const current = prev[listId] || [];
          if (current.includes(client.id)) return prev;
          return { ...prev, [listId]: [...current, client.id] };
        });
        toast.success(`${client.name} added to "${listName}"`);
      } catch (err: any) {
        console.error(err);
        toast.error(err.message || "Failed to add to list");
      }
    };

    void doAdd();
  };

  const getClientLists = (clientId: string) => {
    return clientLists.filter((list) => (membership[list.id] || []).includes(clientId));
  };

  const handleExport = () => {
    const headers = ["Name", "Phone", "Location", "Tags", "Status", "Source", "Created At"];
    const rows = clientsList.map((c) => [
      c.name, c.phone, c.location, c.tags.join("; "), c.status, c.source, c.createdAt,
    ]);
    const csvContent = [headers, ...rows].map((r) => r.map(v => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "convaire-clients.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${clientsList.length} clients to CSV`);
  };

  const handleImport = () => {
    const imported = [
      { id: String(Date.now()), name: "Imported Client 1", phone: "+92 300 0000001", location: "Islamabad", tags: ["CSV Import"], status: "active" as const, source: "CSV Import", createdAt: new Date().toISOString().split("T")[0] },
      { id: String(Date.now() + 1), name: "Imported Client 2", phone: "+92 300 0000002", location: "Lahore", tags: ["CSV Import"], status: "active" as const, source: "CSV Import", createdAt: new Date().toISOString().split("T")[0] },
    ];
    setClientsList((prev) => [...imported, ...prev]);
    setImportOpen(false);
    toast.success(`Successfully imported ${imported.length} clients`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1>Clients</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your client database and import contacts.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>
            <Upload className="w-4 h-4" />
            Import CSV
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="w-4 h-4" />
            Add Client
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="gap-3">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">Total Clients</p>
            <p className="text-2xl mt-1">{clientsList.length}</p>
          </CardContent>
        </Card>
        <Card className="gap-3">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">Active</p>
            <p className="text-2xl mt-1 text-green-600">
              {clientsList.filter((c) => c.status === "active").length}
            </p>
          </CardContent>
        </Card>
        <Card className="gap-3">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">Inactive</p>
            <p className="text-2xl mt-1 text-gray-500">
              {clientsList.filter((c) => c.status === "inactive").length}
            </p>
          </CardContent>
        </Card>
        <Card className="gap-3">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">Do Not Call</p>
            <p className="text-2xl mt-1 text-red-500">
              {clientsList.filter((c) => c.status === "do_not_call").length}
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
                placeholder="Search by name or phone..."
                className="bg-transparent outline-none text-sm w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              className="border border-border rounded-lg px-3 py-2 text-sm bg-transparent"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="do_not_call">Do Not Call</option>
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
                Loading clients...
              </span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead className="hidden md:table-cell">Location</TableHead>
                  <TableHead className="hidden lg:table-cell">Tags</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Source</TableHead>
                  <TableHead className="hidden lg:table-cell">Created</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((client) => (
                  <TableRow key={client.id} className="cursor-pointer">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-xs text-accent-foreground">
                          {client.name.split(" ").map(n => n[0]).join("")}
                        </div>
                        <span className="text-sm">{client.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Phone className="w-3 h-3" />
                        {client.phone}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        {client.location}
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex gap-1 flex-wrap">
                        {client.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusStyles[client.status]}>
                        {client.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {client.source}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                      {client.createdAt}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1 rounded hover:bg-accent">
                            <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52">
                          <DropdownMenuLabel className="text-xs">{client.name}</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuGroup>
                            <DropdownMenuItem onClick={() => openView(client)}>
                              <Eye className="w-4 h-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEdit(client)}>
                              <Pencil className="w-4 h-4" />
                              Edit Client
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
                          <DropdownMenuSeparator />

                          {/* Add to List submenu */}
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                              <ListChecks className="w-4 h-4" />
                              Add to List
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent>
                              {clientLists.map((list) => {
                                const isInList = (membership[list.id] || []).includes(client.id);
                                return (
                                  <DropdownMenuItem
                                    key={list.id}
                                    onClick={() => addToList(client, list.id, list.name)}
                                    disabled={isInList}
                                  >
                                    {isInList && <CheckCircle2 className="w-3 h-3 text-green-500" />}
                                    <span className={isInList ? "text-muted-foreground" : ""}>{list.name}</span>
                                  </DropdownMenuItem>
                                );
                              })}
                            </DropdownMenuSubContent>
                          </DropdownMenuSub>

                          {/* Change Status submenu */}
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                              <CheckCircle2 className="w-4 h-4" />
                              Change Status
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent>
                              <DropdownMenuItem
                                onClick={() => changeStatus(client, "active")}
                                disabled={client.status === "active"}
                              >
                                <CheckCircle2 className="w-3 h-3 text-green-500" />
                                Active
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => changeStatus(client, "inactive")}
                                disabled={client.status === "inactive"}
                              >
                                <UserX className="w-3 h-3 text-gray-500" />
                                Inactive
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => changeStatus(client, "do_not_call")}
                                disabled={client.status === "do_not_call"}
                              >
                                <Ban className="w-3 h-3 text-red-500" />
                                Do Not Call
                              </DropdownMenuItem>
                            </DropdownMenuSubContent>
                          </DropdownMenuSub>

                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => setDeleteClient(client)}
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete Client
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* View Client Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Client Details</DialogTitle>
            <DialogDescription>View full client information and list memberships.</DialogDescription>
          </DialogHeader>
          {selectedClient && (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-accent flex items-center justify-center text-base text-accent-foreground">
                  {selectedClient.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <p className="text-base">{selectedClient.name}</p>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
                    <Phone className="w-3 h-3" />
                    {selectedClient.phone}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
                    <MapPin className="w-3 h-3" />
                    {selectedClient.location}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={statusStyles[selectedClient.status]}>
                  {selectedClient.status.replace("_", " ")}
                </Badge>
                {selectedClient.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-border pt-4">
                <div>
                  <p className="text-xs text-muted-foreground">Source</p>
                  <p className="text-sm mt-0.5">{selectedClient.source}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Created</p>
                  <p className="text-sm mt-0.5">{selectedClient.createdAt}</p>
                </div>
              </div>

              {/* Show which lists this client belongs to */}
              {(() => {
                const inLists = getClientLists(selectedClient.id);
                if (inLists.length === 0) return null;
                return (
                  <div className="border-t border-border pt-4">
                    <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                      <ListChecks className="w-3 h-3" />
                      Member of Lists
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {inLists.map((list) => (
                        <Badge key={list.id} variant="secondary">{list.name}</Badge>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setViewOpen(false);
                if (selectedClient) openEdit(selectedClient);
              }}
            >
              <Pencil className="w-4 h-4" />
              Edit
            </Button>
            <Button variant="outline" onClick={() => setViewOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Client Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Edit Client</DialogTitle>
            <DialogDescription>Update client information.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input
                  value={editClient.name}
                  onChange={(e) => setEditClient({ ...editClient, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Phone Number *</Label>
                <Input
                  value={editClient.phone}
                  onChange={(e) => setEditClient({ ...editClient, phone: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  value={editClient.location}
                  onChange={(e) => setEditClient({ ...editClient, location: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Source</Label>
                <Select value={editClient.source} onValueChange={(v) => setEditClient({ ...editClient, source: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Manual">Manual</SelectItem>
                    <SelectItem value="CSV Import">CSV Import</SelectItem>
                    <SelectItem value="Website">Website</SelectItem>
                    <SelectItem value="Referral">Referral</SelectItem>
                    <SelectItem value="Social Media">Social Media</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tags</Label>
                <Input
                  placeholder="Investor, Premium"
                  value={editClient.tags}
                  onChange={(e) => setEditClient({ ...editClient, tags: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={editClient.status} onValueChange={(v) => setEditClient({ ...editClient, status: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="do_not_call">Do Not Call</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)} disabled={updating}>Cancel</Button>
            <Button onClick={handleEditClient} disabled={updating} className="gap-2">
              {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Update Client
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Client Confirmation */}
      <AlertDialog open={!!deleteClient} onOpenChange={(open) => !open && setDeleteClient(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete client {deleteClient?.name}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this client from your database and from all client lists. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setDeleteClient(null)}
              disabled={deleting}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleting}
              onClick={() => {
                if (deleteClient) {
                  handleDelete(deleteClient);
                }
              }}
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Client Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Add New Client</DialogTitle>
            <DialogDescription>
              Enter client details to add them to your database.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input
                  placeholder="e.g., Ahmed Khan"
                  value={newClient.name}
                  onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Phone Number *</Label>
                <Input
                  placeholder="+92 3XX XXXXXXX"
                  value={newClient.phone}
                  onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  placeholder="e.g., Islamabad"
                  value={newClient.location}
                  onChange={(e) => setNewClient({ ...newClient, location: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Source</Label>
                <Select value={newClient.source} onValueChange={(v) => setNewClient({ ...newClient, source: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Manual">Manual</SelectItem>
                    <SelectItem value="CSV Import">CSV Import</SelectItem>
                    <SelectItem value="Website">Website</SelectItem>
                    <SelectItem value="Referral">Referral</SelectItem>
                    <SelectItem value="Social Media">Social Media</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tags</Label>
                <Input
                  placeholder="Investor, Premium (comma separated)"
                  value={newClient.tags}
                  onChange={(e) => setNewClient({ ...newClient, tags: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={newClient.status} onValueChange={(v) => setNewClient({ ...newClient, status: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="do_not_call">Do Not Call</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                placeholder="Any additional notes about the client..."
                value={newClient.notes}
                onChange={(e) => setNewClient({ ...newClient, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)} disabled={adding}>Cancel</Button>
            <Button onClick={handleAddClient} disabled={adding} className="gap-2">
              {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Add Client
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import CSV Dialog */}
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Clients from CSV</DialogTitle>
            <DialogDescription>
              Upload a CSV file with columns: Name, Phone, Location, Tags, Status.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
              <FileUp className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">
                Drag & drop your CSV file here, or click to browse
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Supports .csv files up to 10MB
              </p>
              <Button variant="outline" size="sm" className="mt-4">
                Browse Files
              </Button>
            </div>
            <div className="bg-accent/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">
                <strong>Required columns:</strong> Name, Phone<br />
                <strong>Optional columns:</strong> Location, Tags, Status, Source
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportOpen(false)}>Cancel</Button>
            <Button onClick={handleImport}>
              <Upload className="w-4 h-4" />
              Import (Demo)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}