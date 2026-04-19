import { ThemeToggle } from "@/components/theme-toggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Ambient gradient backdrop — subtle but premium */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-app-mesh"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.35] [mask-image:radial-gradient(closest-side_at_50%_30%,black,transparent)]"
      >
        <div className="absolute inset-0 bg-app-grid" />
      </div>

      <div className="fixed right-4 top-4 z-50 rounded-lg border border-border bg-card/85 p-0.5 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/70">
        <ThemeToggle />
      </div>

      <div className="relative">{children}</div>
    </div>
  );
}
