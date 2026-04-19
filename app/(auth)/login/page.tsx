import { Suspense } from "react";

import { AuthMark } from "@/components/auth/auth-mark";
import { LoginForm } from "@/components/auth/login-form";
import { AUTH_TAGLINE } from "@/lib/auth-tagline";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-[360px] space-y-8">
        <div className="space-y-4 text-center">
          <AuthMark />
          <div className="space-y-1">
            <p className="text-sm font-semibold tracking-tight text-foreground">
              Convaire
            </p>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              Sign in
            </h1>
            <p className="text-[13px] text-muted-foreground">{AUTH_TAGLINE}</p>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
