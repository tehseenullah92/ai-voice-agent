/**
 * Simple in-memory rate limiter for auth routes (single Node instance).
 * For serverless multi-instance production, replace with Redis / Upstash.
 */

type Entry = { count: number; windowStart: number };

const store = new Map<string, Entry>();

export function rateLimit(
  key: string,
  max: number,
  windowMs: number
): { ok: true } | { ok: false; retryAfterSec: number } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now - entry.windowStart > windowMs) {
    store.set(key, { count: 1, windowStart: now });
    return { ok: true };
  }

  if (entry.count >= max) {
    const retryAfterSec = Math.ceil(
      (entry.windowStart + windowMs - now) / 1000
    );
    return { ok: false, retryAfterSec: Math.max(1, retryAfterSec) };
  }

  entry.count += 1;
  return { ok: true };
}

export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? "unknown";
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}
