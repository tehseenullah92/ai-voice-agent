import Link from "next/link";

import { AuthMark } from "@/components/auth/auth-mark";
import { buttonVariants } from "@/components/ui/button";
import { AUTH_TAGLINE } from "@/lib/auth-tagline";

export default function ForgotPasswordPage() {
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
              Reset password
            </h1>
            <p className="text-[13px] text-muted-foreground">{AUTH_TAGLINE}</p>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <p className="text-[13px] leading-relaxed text-muted-foreground">
            Email-based password reset is not set up for this app yet. If you
            are locked out, create a new account with a different email or
            contact the person who runs your deployment for a database reset.
          </p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Link href="/login" className={buttonVariants({ variant: "default" })}>
              Back to sign in
            </Link>
            <Link
              href="/signup"
              className={buttonVariants({ variant: "outline" })}
            >
              Create account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
