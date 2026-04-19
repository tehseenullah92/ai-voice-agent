import { Redis } from "@upstash/redis";

let client: Redis | null = null;

export function isUpstashRedisConfigured(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL?.trim() &&
      process.env.UPSTASH_REDIS_REST_TOKEN?.trim()
  );
}

/**
 * Upstash Redis REST client. Only call when `isUpstashRedisConfigured()` is true.
 */
export function getUpstashRedis(): Redis {
  if (!isUpstashRedisConfigured()) {
    throw new Error(
      "Upstash Redis is not configured (UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN)"
    );
  }
  if (!client) {
    client = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }
  return client;
}
