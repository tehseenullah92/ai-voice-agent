import { NextResponse } from "next/server";

import { issueAndSendVerificationEmail } from "@/lib/auth/email-verification";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ip = clientIp(request);
  const limited = rateLimit(
    `resend-verify:${session.userId}:${ip}`,
    5,
    60 * 60 * 1000
  );
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many resend attempts. Try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(limited.retryAfterSec) },
      }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, email: true, emailVerifiedAt: true },
  });
  if (!user) {
    return NextResponse.json({ error: "Account not found." }, { status: 404 });
  }
  if (user.emailVerifiedAt) {
    return NextResponse.json({ ok: true, alreadyVerified: true });
  }

  const result = await issueAndSendVerificationEmail(user.id, user.email);
  if (!result.sent) {
    return NextResponse.json(
      { error: "Could not send email. Try again in a moment." },
      { status: 502 }
    );
  }
  return NextResponse.json({ ok: true });
}
