"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { buttonVariants } from "@/components/ui/button";
import { getDashboardPageMeta } from "@/lib/dashboard-nav";
import { cn } from "@/lib/utils";
import { ChevronRight, Menu } from "lucide-react";

export function DashboardHeader({
  onOpenMobileNav,
}: {
  onOpenMobileNav?: () => void;
}) {
  const pathname = usePathname();
  const { title, crumbs } = getDashboardPageMeta(pathname);

  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border bg-card/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-card/80 sm:px-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)] dark:shadow-[0_1px_0_0_rgba(0,0,0,0.5)]">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        {/* Mobile menu trigger */}
        <button
          type="button"
          onClick={onOpenMobileNav}
          className={cn(
            buttonVariants({ variant: "ghost", size: "icon" }),
            "md:hidden text-muted-foreground hover:text-foreground"
          )}
          aria-label="Open navigation menu"
        >
          <Menu className="size-[18px]" strokeWidth={1.75} />
        </button>

        <div className="min-w-0">
          <h1 className="truncate text-[15px] font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          <nav aria-label="Breadcrumb" className="mt-0.5 hidden sm:block">
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
      </div>
    </header>
  );
}
