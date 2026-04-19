import { SignJWT } from "jose/jwt/sign";
import { jwtVerify } from "jose/jwt/verify";
import { cookies } from "next/headers";

import { SESSION_COOKIE_NAME, SESSION_MAX_AGE_SEC } from "@/lib/auth/constants";
import { getJwtSecret } from "@/lib/auth/jwt-secret";

export type SessionPayload = {
  userId: string;
};

export async function createSessionToken(userId: string): Promise<string> {
  const secret = getJwtSecret();
  return new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SEC}s`)
    .sign(secret);
}

export async function verifySessionToken(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    const sub = payload.sub;
    if (!sub || typeof sub !== "string") return null;
    return { userId: sub };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const token = cookies().get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}
