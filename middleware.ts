import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";
import { isValidSessionToken } from "@/lib/auth/middleware-verify";

const AUTH_PAGES = ["/login", "/signup", "/forgot-password"];

function isPublicApiPath(pathname: string): boolean {
  if (pathname === "/api/auth/login" || pathname === "/api/auth/signup") {
    return true;
  }
  if (pathname === "/api/auth/clear-session") {
    return true;
  }
  // Verifying an email link from an inbox should not require an active session.
  if (pathname === "/api/auth/verify-email") {
    return true;
  }
  if (
    pathname.startsWith("/api/calls/twiml") ||
    pathname.startsWith("/api/calls/status")
  ) {
    return true;
  }
  if (pathname.startsWith("/api/elevenlabs/webhook")) {
    return true;
  }
  if (pathname.startsWith("/api/billing/webhook")) {
    return true;
  }
  if (pathname.startsWith("/api/cron/")) {
    return true;
  }
  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  const authed = await isValidSessionToken(token);

  if (pathname.startsWith("/dashboard")) {
    if (!authed) {
      const login = new URL("/login", request.url);
      login.searchParams.set("next", pathname);
      return NextResponse.redirect(login);
    }
    return NextResponse.next();
  }

  if (AUTH_PAGES.includes(pathname)) {
    if (authed) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    if (isPublicApiPath(pathname)) {
      return NextResponse.next();
    }
    if (!authed) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/login",
    "/signup",
    "/forgot-password",
    "/api/:path*",
  ],
};
