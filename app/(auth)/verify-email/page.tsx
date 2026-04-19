import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { AuthShell } from "@/components/auth/auth-shell";
import { VerifyEmailClient } from "@/components/auth/verify-email-client";
import { buttonVariants } from "@/components/ui/button";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

type Status = "ok" | "expired" | "invalid" | "pending";

function normalizeStatus(value: string | string[] | undefined): Status {
  const v = Array.isArray(value) ? value[0] : value;
  if (v === "ok" || v === "expired" || v === "invalid") return v;
  return "pending";
}

function safeNext(value: string | string[] | undefined): string | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return null;
  // Only allow same-origin paths to avoid open-redirects.
  if (!raw.startsWith("/") || raw.startsWith("//")) return null;
  return raw;
}

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: {
    status?: string | string[];
    sent?: string | string[];
    next?: string | string[];
  };
}) {
  const session = await getSession();
  const user = session
    ? await prisma.user.findUnique({
        where: { id: session.userId },
        select: { email: true, emailVerifiedAt: true },
      })
    : null;

  const status = normalizeStatus(searchParams.status);
  const next = safeNext(searchParams.next);
  const justSent = searchParams.sent === "1";

  // If they're already verified and signed in, hop straight to the next page
  // (or the dashboard) — no need to keep them on a confirmation screen.
  if (user?.emailVerifiedAt && (status === "ok" || status === "pending")) {
    redirect(next ?? "/dashboard");
  }

  const heading =
    status === "ok"
      ? "Email verified"
      : status === "expired"
        ? "Link expired"
        : status === "invalid"
          ? "Invalid link"
          : "Verify your email";

  return (
    <AuthShell title={heading}>
      <Suspense fallback={null}>
        <VerifyEmailClient
          status={status}
          email={user?.email ?? null}
          authed={Boolean(session)}
          next={next}
          justSent={justSent}
        />
      </Suspense>
      {!session && status !== "ok" ? (
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Link
            href="/login"
            className={buttonVariants({
              variant: "default",
              className: "flex-1 justify-center",
            })}
          >
            Sign in
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
      ) : null}
    </AuthShell>
  );
}
