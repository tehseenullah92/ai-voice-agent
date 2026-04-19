"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Coins, LogOut, Settings } from "lucide-react";

import { BrandMark } from "@/components/brand-mark";
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
import {
  dashboardMainNavItems,
  dashboardSettingsNavItem,
} from "@/lib/dashboard-nav";
import { emailDisplayName, emailInitials } from "@/lib/user-display";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";

type AppSidebarProps = {
  userEmail: string;
  credits: number;
  /**
   * Called whenever a navigation link inside the sidebar is activated.
   * Used by the mobile drawer to auto-close when the user navigates.
   */
  onNavigate?: () => void;
  /** Render variant — drawer omits the fixed positioning. */
  variant?: "desktop" | "drawer";
};

export function AppSidebar({
  userEmail,
  credits,
  onNavigate,
  variant = "desktop",
}: AppSidebarProps) {
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

  const isDesktop = variant === "desktop";

  return (
    <aside
      className={cn(
        "flex h-full w-full flex-col bg-sidebar text-sidebar-foreground",
        isDesktop &&
          "fixed left-0 top-0 z-40 hidden h-screen w-[244px] border-r border-sidebar-border md:flex shadow-[1px_0_0_rgba(15,23,42,0.04)] dark:shadow-[1px_0_0_rgba(0,0,0,0.4)]"
      )}
    >
      {/* Brand row */}
      <div className="flex h-16 items-center justify-between gap-2 border-b border-sidebar-border px-4">
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="flex min-w-0 items-center gap-2.5 truncate rounded-md outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
        >
          <BrandMark brandColor className="size-7 shrink-0" aria-hidden />
          <span className="truncate text-[15px] font-semibold tracking-tight text-foreground">
            Convaire
          </span>
        </Link>
        <ThemeToggle />
      </div>

      {/* Primary nav */}
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-2.5">
        <p className="px-2.5 pb-1.5 pt-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/80">
          Workspace
        </p>
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
              onClick={onNavigate}
              className={cn(
                "group/nav relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors",
                active
                  ? "bg-muted text-foreground shadow-[inset_0_0_0_1px_rgba(15,23,42,0.06)] dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]"
                  : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
              )}
            >
              {active ? (
                <span
                  aria-hidden
                  className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full"
                  style={{ background: "var(--gradient-primary)" }}
                />
              ) : null}
              <Icon
                className={cn(
                  "size-[15px] shrink-0 opacity-90 transition-colors",
                  active ? "text-primary" : "group-hover/nav:text-foreground"
                )}
                strokeWidth={1.75}
              />
              {item.label}
            </Link>
          );
        })}

        <Link
          href={dashboardSettingsNavItem.href}
          onClick={onNavigate}
          className={cn(
            "group/nav relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors",
            settingsActive
              ? "bg-muted text-foreground shadow-[inset_0_0_0_1px_rgba(15,23,42,0.06)] dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]"
              : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
          )}
        >
          {settingsActive ? (
            <span
              aria-hidden
              className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full"
              style={{ background: "var(--gradient-primary)" }}
            />
          ) : null}
          <SettingsIcon
            className={cn(
              "size-[15px] shrink-0 opacity-90",
              settingsActive ? "text-primary" : ""
            )}
            strokeWidth={1.75}
          />
          {dashboardSettingsNavItem.label}
        </Link>
      </nav>

      {/* Credits — premium gradient strip */}
      <div className="border-t border-sidebar-border p-2.5">
        <Link
          href="/dashboard/billing"
          onClick={onNavigate}
          className="group/credits relative flex items-center justify-between gap-2 overflow-hidden rounded-lg border border-border/70 bg-card px-3 py-2.5 text-xs transition-all hover:border-primary/30 hover:shadow-[0_1px_2px_rgba(79,70,229,0.08)]"
        >
          <span
            aria-hidden
            className="absolute inset-y-0 left-0 w-[3px] opacity-70"
            style={{ background: "var(--gradient-primary)" }}
          />
          <span className="flex items-center gap-2 pl-1.5">
            <Coins className="size-3.5 text-primary" />
            <span className="text-muted-foreground">Credits</span>
          </span>
          <span className="tabular-nums text-[13px] font-semibold text-foreground">
            {credits.toLocaleString()}
          </span>
        </Link>
      </div>

      {/* User block */}
      <div className="border-t border-sidebar-border p-2.5">
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "h-auto w-full justify-start gap-2.5 rounded-lg px-2 py-2 text-left font-normal hover:bg-accent/60"
            )}
          >
            <Avatar className="size-8 shrink-0 ring-2 ring-card">
              <AvatarFallback
                className="text-[11px] font-semibold text-primary-foreground"
                style={{ background: "var(--gradient-primary)" }}
              >
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
          <DropdownMenuContent side="top" align="start" className="w-60">
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
            <DropdownMenuItem
              onClick={() => {
                onNavigate?.();
                router.push("/dashboard/settings");
              }}
            >
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
