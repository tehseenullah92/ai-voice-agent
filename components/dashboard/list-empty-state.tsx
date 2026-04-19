import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function ListEmptyState({
  icon: Icon,
  title,
  description,
  className,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-border bg-card/40 px-8 py-16 text-center ring-1 ring-foreground/5",
        className
      )}
    >
      <div
        className="mb-5 flex size-14 items-center justify-center rounded-full border border-border bg-muted/30"
        aria-hidden
      >
        <Icon className="size-7 text-muted-foreground" strokeWidth={1.5} />
      </div>
      <h3 className="text-[15px] font-semibold tracking-tight text-foreground">
        {title}
      </h3>
      <p className="mt-2 max-w-sm text-[13px] leading-relaxed text-muted-foreground">
        {description}
      </p>
      {children ? <div className="mt-6">{children}</div> : null}
    </div>
  );
}
