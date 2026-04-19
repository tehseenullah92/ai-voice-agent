/**
 * HS256 signing key material. Use SESSION_SECRET or NEXTAUTH_SECRET (min 32 chars in production).
 */
export function getJwtSecret(): Uint8Array {
  const s = process.env.SESSION_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (!s || s.length < 32) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "SESSION_SECRET or NEXTAUTH_SECRET must be set to at least 32 characters in production."
      );
    }
    return new TextEncoder().encode(
      "dev-only-secret-do-not-use-in-production-32"
    );
  }
  return new TextEncoder().encode(s);
}
