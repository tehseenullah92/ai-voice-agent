import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "./lib/server-auth";

const PUBLIC_PATHS = new Set([
  "/",
  "/home",
  "/brand",
  "/signin",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
]);

const PUBLIC_API_PATHS = new Set(["/api/auth/session"]);

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.has(pathname);
}

function isPublicApiPath(pathname: string) {
  return PUBLIC_API_PATHS.has(pathname);
}

export function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const hasSession = Boolean(req.cookies.get(SESSION_COOKIE_NAME)?.value);

  if (pathname.startsWith("/api")) {
    if (isPublicApiPath(pathname) || hasSession) {
      return NextResponse.next();
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (isPublicPath(pathname) || hasSession) {
    return NextResponse.next();
  }

  const signInUrl = req.nextUrl.clone();
  signInUrl.pathname = "/signin";
  signInUrl.searchParams.set("from", `${pathname}${search}`);
  return NextResponse.redirect(signInUrl);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js|map)$).*)",
  ],
};
