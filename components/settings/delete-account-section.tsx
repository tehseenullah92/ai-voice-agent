"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function DeleteAccountSection() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);

  async function onConfirm() {
    if (!password.trim()) {
      toast.error("Enter your password to confirm.");
      return;
    }
    setPending(true);
    try {
      const res = await fetch("/api/auth/delete-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        toast.error(data.error ?? "Could not delete account.");
        return;
      }
      toast.success("Account deleted.");
      setOpen(false);
      router.replace("/login");
    } catch {
      toast.error("Could not reach the server.");
    } finally {
      setPending(false);
      setPassword("");
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-destructive/30 bg-destructive/10">
          <AlertTriangle className="size-4 text-destructive" strokeWidth={1.75} />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-destructive">Danger zone</h3>
          <p className="text-[13px] text-muted-foreground">
            Irreversible actions that affect your entire account.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">Delete account</p>
            <p className="text-[13px] text-muted-foreground">
              Permanently remove your account, workspace, campaigns, contacts,
              and call history. This cannot be undone.
            </p>
          </div>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="shrink-0"
            onClick={() => setOpen(true)}
          >
            Delete account…
          </Button>
        </div>
      </div>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setPassword("");
        }}
      >
        <DialogContent className="border-border bg-card text-foreground sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete your account?</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              This removes your user, Twilio credentials stored in Convaire,
              campaigns, and all related data.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="del-pw">Confirm with your password</Label>
            <Input
              id="del-pw"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-9 bg-background"
            />
          </div>
          <DialogFooter className="border-border bg-muted/30 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={pending}
              onClick={() => void onConfirm()}
            >
              {pending ? "Deleting…" : "Delete forever"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
