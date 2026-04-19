import { PhoneCall } from "lucide-react";

export function AuthMark() {
  return (
    <div
      className="mx-auto flex size-12 items-center justify-center rounded-xl border border-border bg-card shadow-sm ring-1 ring-foreground/5"
      aria-hidden
    >
      <PhoneCall className="size-6 text-primary" strokeWidth={1.75} />
    </div>
  );
}
