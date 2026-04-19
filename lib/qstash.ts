import { Receiver } from "@upstash/qstash";

export function isQStashVerificationConfigured(): boolean {
  return Boolean(process.env.QSTASH_CURRENT_SIGNING_KEY?.trim());
}

/**
 * Verify a QStash-signed request (schedules, publishes). Use the raw body string
 * exactly as received (empty string for GET).
 *
 * Omitting `url` avoids mismatches when the edge sees a different host than QStash used.
 *
 * Note: Upstash's `Receiver` only applies your keys when **both** current and next are
 * provided (or both exist in env). If you only set the current key, we duplicate it
 * for `nextSigningKey` so verification still works until you add the next key.
 */
export async function verifyQStashRequest(params: {
  signature: string | null;
  rawBody: string;
  /** From `upstash-region` header — required for regional signing keys in env. */
  upstashRegion?: string | null;
}): Promise<boolean> {
  const currentSigningKey = process.env.QSTASH_CURRENT_SIGNING_KEY?.trim();
  const nextFromEnv = process.env.QSTASH_NEXT_SIGNING_KEY?.trim();
  if (!currentSigningKey || !params.signature) return false;

  const nextSigningKey = nextFromEnv || currentSigningKey;

  const receiver = new Receiver({
    currentSigningKey,
    nextSigningKey,
  });

  try {
    await receiver.verify({
      signature: params.signature,
      body: params.rawBody,
      clockTolerance: 60,
      ...(params.upstashRegion
        ? { upstashRegion: params.upstashRegion }
        : {}),
    });
    return true;
  } catch {
    return false;
  }
}
