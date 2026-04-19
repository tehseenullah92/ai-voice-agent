import { NextResponse } from "next/server";

import { SESSION_COOKIE_NAME, SESSION_MAX_AGE_SEC } from "@/lib/auth/constants";
import { verifyPassword } from "@/lib/auth/password";
import { createSessionToken } from "@/lib/auth/session";
import { loginBodySchema } from "@/lib/auth/validation";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const ip = clientIp(request);
  const limited = rateLimit(`login:${ip}`, 30, 15 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many login attempts. Try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(limited.retryAfterSec) },
      }
    );
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = loginBodySchema.safeParse(json);
  if (!parsed.success) {
    const msg = parsed.error.flatten().fieldErrors;
    const first =
      msg.email?.[0] ?? msg.password?.[0] ?? "Invalid request body.";
    return NextResponse.json({ error: first }, { status: 400 });
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  const valid =
    user && (await verifyPassword(password, user.password));

  if (!valid) {
    return NextResponse.json(
      { error: "Invalid email or password." },
      { status: 401 }
    );
  }

  const token = await createSessionToken(user.id);
  const res = NextResponse.json({ ok: true, userId: user.id });
  res.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SEC,
  });
  return res;
}
