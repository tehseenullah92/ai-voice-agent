import { NextResponse } from "next/server";

import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";

/**
 * Clears an invalid or stale session cookie (e.g. user row deleted) and sends the browser to /login.
 */
export async function GET(request: Request) {
  const res = NextResponse.redirect(new URL("/login", request.url));
  res.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
