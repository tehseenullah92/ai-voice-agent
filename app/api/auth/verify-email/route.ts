import { NextResponse } from "next/server";

import { consumeVerificationToken } from "@/lib/auth/email-verification";
import { getPublicAppUrl } from "@/lib/public-app-url";
import { clientIp, rateLimit } from "@/lib/rate-limit";

function redirect(status: "ok" | "expired" | "invalid", next?: string | null) {
  const base = getPublicAppUrl();
  const url = new URL("/verify-email", `${base}/`);
  url.searchParams.set("status", status);
  if (next) url.searchParams.set("next", next);
  return NextResponse.redirect(url);
}

export async function GET(request: Request) {
  const ip = clientIp(request);
  const limited = rateLimit(`verify-email:${ip}`, 30, 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many requests. Try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(limited.retryAfterSec) },
      }
    );
  }

  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const next = searchParams.get("next");

  const result = await consumeVerificationToken(token ?? "");
  if (!result.ok) {
    if (result.reason === "expired") return redirect("expired", next);
    return redirect("invalid", next);
  }
  return redirect("ok", next);
}
