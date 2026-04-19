"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Settings, Sparkles } from "lucide-react";
import { useState } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  dashboardMainNavItems,
  dashboardSettingsNavItem,
} from "@/lib/dashboard-nav";
import { emailDisplayName, emailInitials } from "@/lib/user-display";
import { cn } from "@/lib/utils";

export function AppSidebar({
  userEmail,
  credits,
}: {
  userEmail: string;
  credits: number;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const initials = emailInitials(userEmail);
  const shortName = emailDisplayName(userEmail);
  const SettingsIcon = dashboardSettingsNavItem.icon;

  async function onLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.replace("/login");
    } finally {
      setLoggingOut(false);
    }
  }

  const settingsActive =
    pathname === dashboardSettingsNavItem.href ||
    pathname.startsWith(`${dashboardSettingsNavItem.href}/`);

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-[220px] flex-col border-r border-border bg-card">
      <div className="flex h-14 items-center border-b border-border px-4">
        <Link
          href="/dashboard"
          className="text-sm font-semibold tracking-tight text-foreground"
        >
          Convaire
        </Link>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 p-2">
        {dashboardMainNavItems.map((item) => {
          const active =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[13px] font-medium transition-colors",
                active
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
              )}
            >
              <Icon className="size-[15px] shrink-0 opacity-90" strokeWidth={1.75} />
              {item.label}
            </Link>
          );
        })}
        <Separator className="my-2 bg-border" />
        <Link
          href={dashboardSettingsNavItem.href}
          className={cn(
            "flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[13px] font-medium transition-colors",
            settingsActive
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
          )}
        >
          <SettingsIcon className="size-[15px] shrink-0 opacity-90" strokeWidth={1.75} />
          {dashboardSettingsNavItem.label}
        </Link>
      </nav>
      <div className="border-t border-border">
        <Link
          href="/dashboard/billing"
          className="flex items-center gap-2 px-4 py-2.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <Sparkles className="size-3.5" />
          <span className="tabular-nums font-medium">{credits.toLocaleString()}</span>
          <span>credits</span>
        </Link>
      </div>
      <div className="border-t border-border p-2">
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "h-auto w-full justify-start gap-2.5 rounded-md px-2 py-2 text-left font-normal hover:bg-accent/60"
            )}
          >
            <Avatar className="size-8 shrink-0 border border-border">
              <AvatarFallback className="bg-muted text-[11px] font-medium text-muted-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 text-left">
              <p className="truncate text-[13px] font-medium leading-tight text-foreground">
                {shortName}
              </p>
              <p className="truncate text-[12px] text-muted-foreground">
                {userEmail}
              </p>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal">
                <span className="block truncate text-xs text-muted-foreground">
                  Signed in as
                </span>
                <span className="block truncate text-sm text-foreground">
                  {userEmail}
                </span>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>
              <Settings className="size-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              disabled={loggingOut}
              onClick={() => void onLogout()}
            >
              <LogOut className="size-4" />
              {loggingOut ? "Signing out…" : "Log out"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
