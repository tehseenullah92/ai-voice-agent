import type { ReactNode } from "react";

import { AuthMark } from "@/components/auth/auth-mark";
import { AUTH_TAGLINE } from "@/lib/auth-tagline";

/**
 * Shared visual shell for /login, /signup, /forgot-password.
 * Centers the brand mark + a polished card with consistent typography,
 * elevation and responsive padding.
 */
export function AuthShell({
  title,
  children,
  footer,
}: {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-10 sm:px-6">
      <div className="w-full max-w-[400px] space-y-7">
        <div className="space-y-5 text-center">
          <AuthMark />
          <div className="space-y-1.5">
            <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Convaire
            </p>
            <h1 className="text-[26px] font-semibold leading-tight tracking-tight text-foreground sm:text-[28px]">
              <span className="text-gradient-brand">{title}</span>
            </h1>
            <p className="mx-auto max-w-[320px] text-[13px] leading-relaxed text-muted-foreground">
              {AUTH_TAGLINE}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-[0_1px_2px_rgba(15,23,42,0.05),0_12px_32px_-12px_rgba(15,23,42,0.12)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.4),0_16px_40px_-16px_rgba(0,0,0,0.6)] sm:p-7">
          {children}
        </div>

        {footer ? (
          <div className="text-center text-[12px] text-muted-foreground">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
