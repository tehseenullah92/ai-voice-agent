import Link from "next/link";

import { AuthShell } from "@/components/auth/auth-shell";
import { buttonVariants } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  return (
    <AuthShell title="Reset your password">
      <p className="text-[13px] leading-relaxed text-muted-foreground">
        Email-based password reset is not set up for this app yet. If you are
        locked out, create a new account with a different email or contact the
        person who runs your deployment for a database reset.
      </p>
      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <Link
          href="/login"
          className={buttonVariants({
            variant: "default",
            className: "flex-1 justify-center",
          })}
        >
          Back to sign in
        </Link>
        <Link
          href="/signup"
          className={buttonVariants({
            variant: "outline",
            className: "flex-1 justify-center",
          })}
        >
          Create account
        </Link>
      </div>
    </AuthShell>
  );
}
