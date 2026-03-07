import { NextRequest, NextResponse } from "next/server";
import { prisma } from "./prisma";

export const SESSION_COOKIE_NAME = "voiceestate_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

function normalizeEmail(raw: string) {
  return raw.trim().toLowerCase();
}

export function getSessionEmail(req: NextRequest): string | null {
  const raw = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!raw) return null;

  const email = raw.trim().toLowerCase();
  if (!email || !email.includes("@")) return null;
  return email;
}

export function setSessionCookie(response: NextResponse, email: string) {
  response.cookies.set(SESSION_COOKIE_NAME, normalizeEmail(email), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function getOrCreateAuthenticatedUser(req: NextRequest) {
  const email = getSessionEmail(req);
  if (!email) return null;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return existing;

  const name = email.split("@")[0] || "User";
  return prisma.user.create({
    data: {
      email,
      name,
      password: "local-auth-demo",
    },
  });
}

export function unauthorizedJsonResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
