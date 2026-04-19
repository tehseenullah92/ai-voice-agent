import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import { SESSION_COOKIE_NAME, SESSION_MAX_AGE_SEC } from "@/lib/auth/constants";
import { hashPassword } from "@/lib/auth/password";
import { createSessionToken } from "@/lib/auth/session";
import { signupBodySchema } from "@/lib/auth/validation";
import { grantSignupBonus } from "@/lib/billing/credits";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const ip = clientIp(request);
  const limited = rateLimit(`signup:${ip}`, 10, 60 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many sign-up attempts. Try again later." },
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

  const parsed = signupBodySchema.safeParse(json);
  if (!parsed.success) {
    const msg = parsed.error.flatten().fieldErrors;
    const first =
      msg.email?.[0] ?? msg.password?.[0] ?? "Invalid request body.";
    return NextResponse.json({ error: first }, { status: 400 });
  }

  const { email, password } = parsed.data;

  try {
    const passwordHash = await hashPassword(password);
    const user = await prisma.$transaction(async (tx) => {
      const u = await tx.user.create({
        data: { email, password: passwordHash },
      });
      await tx.workspace.create({ data: { userId: u.id } });
      return u;
    });

    await grantSignupBonus(user.id);

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
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }
    console.error(e);
    return NextResponse.json(
      { error: "Could not create account. Try again." },
      { status: 500 }
    );
  }
}
