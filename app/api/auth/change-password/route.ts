import { NextResponse } from "next/server";

import { changePasswordBodySchema } from "@/lib/auth/validation";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { getSession } from "@/lib/auth/session";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ip = clientIp(request);
  const limited = rateLimit(`change-password:${session.userId}:${ip}`, 10, 60 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Try again later." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } }
    );
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = changePasswordBodySchema.safeParse(json);
  if (!parsed.success) {
    const msg = parsed.error.flatten().fieldErrors;
    const first =
      msg.currentPassword?.[0] ??
      msg.newPassword?.[0] ??
      "Invalid request body.";
    return NextResponse.json({ error: first }, { status: 400 });
  }

  const { currentPassword, newPassword } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, password: true },
  });

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ok = await verifyPassword(currentPassword, user.password);
  if (!ok) {
    return NextResponse.json(
      { error: "Current password is incorrect." },
      { status: 400 }
    );
  }

  const nextHash = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: nextHash },
  });

  return NextResponse.json({ ok: true });
}
