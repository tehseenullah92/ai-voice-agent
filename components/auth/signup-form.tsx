"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { measurePasswordStrength } from "@/lib/password-strength";
import { cn } from "@/lib/utils";

export function SignupForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");

  const strength = useMemo(
    () => measurePasswordStrength(password),
    [password]
  );

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const fd = new FormData(form);
    const email = String(fd.get("email") ?? "").trim();
    const pw = String(fd.get("password") ?? "");

    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pw }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not create account.");
        return;
      }
      router.replace("/dashboard/billing?afterSignup=1");
      router.refresh();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="space-y-4">
      {error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-[13px] text-destructive">
          {error}
        </p>
      ) : null}
      <div className="space-y-2">
        <Label htmlFor="signup-email">Email</Label>
        <Input
          id="signup-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@company.com"
          className="h-10 bg-background"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-password">Password</Label>
        <Input
          id="signup-password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          placeholder="••••••••"
          className="h-10 bg-background"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {password.length > 0 ? (
          <div className="space-y-2 pt-0.5">
            <div className="flex gap-1" aria-hidden>
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={cn(
                    "h-1 flex-1 rounded-full bg-muted transition-colors",
                    strength.score >= i &&
                      (strength.score <= 2
                        ? "bg-amber-500/80"
                        : strength.score === 3
                          ? "bg-emerald-500/70"
                          : "bg-emerald-400")
                  )}
                />
              ))}
            </div>
            <p
              className={cn(
                "text-[12px] leading-snug",
                strength.score <= 1 && strength.score > 0
                  ? "text-amber-600 dark:text-amber-400"
                  : strength.score >= 4
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-muted-foreground"
              )}
            >
              {strength.label}
            </p>
          </div>
        ) : (
          <p className="text-[12px] text-muted-foreground">
            Use at least 8 characters. Longer passwords with mixed case,
            numbers, and symbols are stronger.
          </p>
        )}
      </div>
      <Button
        type="submit"
        className="mt-2 h-10 w-full font-medium"
        disabled={loading}
      >
        {loading ? "Creating account…" : "Create account"}
      </Button>
      <p className="text-center text-[13px] text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-primary hover:underline"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
