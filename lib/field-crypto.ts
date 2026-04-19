import { createCipheriv, createDecipheriv, randomBytes, createHash } from "crypto";

import { getJwtSecret } from "@/lib/auth/jwt-secret";

const PREFIX = "cv1:";

function getEncryptionKey(): Buffer {
  return createHash("sha256").update(getJwtSecret()).digest();
}

/** Encrypt sensitive strings at rest (e.g. Twilio auth token). */
export function encryptSecret(plain: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const enc = Buffer.concat([
    cipher.update(plain, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return `${PREFIX}${Buffer.concat([iv, tag, enc]).toString("base64url")}`;
}

export function decryptSecret(stored: string): string {
  if (!stored.startsWith(PREFIX)) {
    return stored;
  }
  const raw = Buffer.from(stored.slice(PREFIX.length), "base64url");
  const iv = raw.subarray(0, 12);
  const tag = raw.subarray(12, 28);
  const data = raw.subarray(28);
  const key = getEncryptionKey();
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString(
    "utf8"
  );
}
