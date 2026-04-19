"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
import { getDashboardPageMeta } from "@/lib/dashboard-nav";
import { cn } from "@/lib/utils";
import { Bell, ChevronRight } from "lucide-react";

export function DashboardHeader() {
  const pathname = usePathname();
  const { title, crumbs } = getDashboardPageMeta(pathname);

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="min-w-0">
        <h1 className="text-[15px] font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        <nav aria-label="Breadcrumb" className="mt-0.5">
          <ol className="flex flex-wrap items-center gap-1 text-[12px] text-muted-foreground">
            {crumbs.map((c, i) => (
              <li key={`${c.label}-${i}`} className="flex items-center gap-1">
                {i > 0 ? (
                  <ChevronRight
                    className="size-3 shrink-0 opacity-60"
                    aria-hidden
                  />
                ) : null}
                {c.href ? (
                  <Link
                    href={c.href}
                    className="transition-colors hover:text-foreground"
                  >
                    {c.label}
                  </Link>
                ) : (
                  <span
                    className={cn(
                      "font-normal",
                      crumbs.length === 1
                        ? "text-muted-foreground"
                        : "text-foreground"
                    )}
                    aria-current={i === crumbs.length - 1 ? "page" : undefined}
                  >
                    {c.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      </div>
      <div className="flex items-center gap-0.5">
        <DropdownMenu>
          <DropdownMenuTrigger
            className={buttonVariants({
              variant: "ghost",
              size: "icon",
              className: "text-muted-foreground hover:text-foreground",
            })}
            aria-label="Notifications"
          >
            <Bell className="size-[18px]" strokeWidth={1.75} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled className="text-muted-foreground">
              You&apos;re all caught up — nothing new yet.
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
