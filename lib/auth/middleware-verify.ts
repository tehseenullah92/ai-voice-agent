import { jwtVerify } from "jose/jwt/verify";

import { getJwtSecret } from "@/lib/auth/jwt-secret";

/**
 * Edge-safe JWT check for middleware (imports only `jose/jwt/verify`, not the full `jose` bundle).
 */
export async function isValidSessionToken(
  token: string | undefined
): Promise<boolean> {
  if (!token) return false;
  try {
    await jwtVerify(token, getJwtSecret());
    return true;
  } catch {
    return false;
  }
}
