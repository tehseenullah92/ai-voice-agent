"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button, buttonVariants } from "@/components/ui/button";

type Status = "ok" | "expired" | "invalid" | "pending";

export function VerifyEmailClient({
  status,
  email,
  authed,
  next,
  justSent,
}: {
  status: Status;
  email: string | null;
  authed: boolean;
  next: string | null;
  justSent: boolean;
}) {
  const router = useRouter();
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState<
    | { kind: "success"; text: string }
    | { kind: "error"; text: string }
    | null
  >(justSent && status === "pending"
    ? { kind: "success", text: "Verification email sent. Check your inbox." }
    : null);

  async function onResend() {
    setFeedback(null);
    setSending(true);
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        alreadyVerified?: boolean;
      };
      if (!res.ok) {
        setFeedback({
          kind: "error",
          text: data.error ?? "Could not send email. Try again.",
        });
        return;
      }
      if (data.alreadyVerified) {
        router.replace(next ?? "/dashboard");
        router.refresh();
        return;
      }
      setFeedback({
        kind: "success",
        text: "Verification email sent. Check your inbox.",
      });
    } catch {
      setFeedback({ kind: "error", text: "Network error. Try again." });
    } finally {
      setSending(false);
    }
  }

  if (status === "ok") {
    const continueHref = authed ? (next ?? "/dashboard") : "/login";
    return (
      <div className="space-y-5">
        <p className="text-[13px] leading-relaxed text-muted-foreground">
          Your email is now verified. You can continue to your account.
        </p>
        <Link
          href={continueHref}
          className={buttonVariants({
            className: "h-10 w-full justify-center font-medium",
          })}
        >
          {authed ? "Continue" : "Go to sign in"}
        </Link>
      </div>
    );
  }

  const intro =
    status === "expired"
      ? "That verification link has expired. Send a new one and try again."
      : status === "invalid"
        ? "That verification link is invalid or has already been used."
        : email
          ? `We sent a verification link to ${email}. Click the link in the email to confirm your address.`
          : "Open the verification link in the email we sent to confirm your address.";

  return (
    <div className="space-y-5">
      <p className="text-[13px] leading-relaxed text-muted-foreground">
        {intro}
      </p>

      {feedback ? (
        <p
          className={
            feedback.kind === "success"
              ? "rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-[13px] text-emerald-700 dark:text-emerald-300"
              : "rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-[13px] text-destructive"
          }
        >
          {feedback.text}
        </p>
      ) : null}

      {authed ? (
        <Button
          type="button"
          onClick={() => void onResend()}
          disabled={sending}
          className="h-10 w-full font-medium"
        >
          {sending ? "Sending…" : "Resend verification email"}
        </Button>
      ) : null}

      <p className="text-center text-[12px] text-muted-foreground">
        Didn’t get an email? Check your spam folder, or{" "}
        {authed ? (
          <button
            type="button"
            onClick={() => void onResend()}
            disabled={sending}
            className="font-medium text-primary hover:underline disabled:opacity-60"
          >
            send another
          </button>
        ) : (
          <Link
            href="/login"
            className="font-medium text-primary hover:underline"
          >
            sign in
          </Link>
        )}
        .
      </p>
    </div>
  );
}
