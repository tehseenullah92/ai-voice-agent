/**
 * Base URL of the app as Twilio and other webhooks see it (scheme + host, no trailing slash).
 * Required for Twilio `url` / `statusCallback` — they must be absolute https URLs in production.
 */
export function getPublicAppUrl(): string {
  const raw = (
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.APP_URL ??
    ""
  ).trim();

  const base = raw.replace(/\/+$/, "");

  if (!base) {
    throw new Error(
      "Missing NEXT_PUBLIC_APP_URL (or APP_URL). Set it to your app’s public base URL, e.g. https://your-domain.com or http://localhost:3000 for local dev with ngrok."
    );
  }

  try {
    const u = new URL(base);
    if (u.protocol !== "http:" && u.protocol !== "https:") {
      throw new Error("invalid protocol");
    }
    if (!u.host) throw new Error("missing host");
  } catch {
    throw new Error(
      `Invalid NEXT_PUBLIC_APP_URL: "${raw}". Use a full URL like https://example.com or http://localhost:3000`
    );
  }

  return base;
}

/**
 * Absolute webhook URL for Twilio (path must start with `/`). Query values are encoded.
 * Prevents relative URLs like `/api/...` which Twilio rejects (error 21205).
 */
export function publicAbsoluteUrl(
  pathname: string,
  searchParams?: Record<string, string>
): string {
  const base = getPublicAppUrl();
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const url = new URL(path, `${base}/`);
  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      url.searchParams.set(key, value);
    }
  }
  return url.href;
}
