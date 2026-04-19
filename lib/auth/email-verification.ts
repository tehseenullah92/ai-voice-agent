import crypto from "node:crypto";

import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { publicAbsoluteUrl } from "@/lib/public-app-url";

const TOKEN_BYTES = 32;
export const VERIFICATION_TOKEN_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours

function hashToken(rawToken: string): string {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

/**
 * Creates a fresh verification token for a user, invalidating any unused
 * tokens still on file. Returns the raw token (only ever returned once).
 */
export async function createVerificationToken(userId: string): Promise<string> {
  const rawToken = crypto.randomBytes(TOKEN_BYTES).toString("base64url");
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS);

  await prisma.$transaction([
    prisma.emailVerificationToken.deleteMany({
      where: { userId, consumedAt: null },
    }),
    prisma.emailVerificationToken.create({
      data: { userId, tokenHash, expiresAt },
    }),
  ]);

  return rawToken;
}

export type ConsumeResult =
  | { ok: true; userId: string; alreadyVerified: boolean }
  | { ok: false; reason: "invalid" | "expired" | "consumed" };

/**
 * Validates and consumes a token, marking the user as verified.
 * Tokens are single-use; expired/consumed/unknown tokens are rejected.
 */
export async function consumeVerificationToken(
  rawToken: string
): Promise<ConsumeResult> {
  if (!rawToken || typeof rawToken !== "string") {
    return { ok: false, reason: "invalid" };
  }
  const tokenHash = hashToken(rawToken);
  const record = await prisma.emailVerificationToken.findUnique({
    where: { tokenHash },
  });
  if (!record) return { ok: false, reason: "invalid" };
  if (record.consumedAt) return { ok: false, reason: "consumed" };
  if (record.expiresAt.getTime() < Date.now()) {
    return { ok: false, reason: "expired" };
  }

  const user = await prisma.user.findUnique({
    where: { id: record.userId },
    select: { id: true, emailVerifiedAt: true },
  });
  if (!user) return { ok: false, reason: "invalid" };

  await prisma.$transaction([
    prisma.emailVerificationToken.update({
      where: { id: record.id },
      data: { consumedAt: new Date() },
    }),
    prisma.user.update({
      where: { id: user.id },
      data: { emailVerifiedAt: user.emailVerifiedAt ?? new Date() },
    }),
  ]);

  return {
    ok: true,
    userId: user.id,
    alreadyVerified: Boolean(user.emailVerifiedAt),
  };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildVerificationEmail(verifyUrl: string): {
  subject: string;
  html: string;
  text: string;
} {
  const safeUrl = escapeHtml(verifyUrl);
  const subject = "Verify your email for convaire";
  const text = [
    "Welcome to convaire.",
    "",
    "Confirm your email address by opening the link below:",
    verifyUrl,
    "",
    "This link expires in 24 hours. If you did not create an account, you can ignore this email.",
  ].join("\n");

  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:#f6f6f7;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#0f172a;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:12px;border:1px solid #e5e7eb;">
      <tr>
        <td style="padding:28px 28px 8px 28px;">
          <h1 style="margin:0;font-size:20px;line-height:1.3;font-weight:600;">Verify your email</h1>
          <p style="margin:12px 0 0;font-size:14px;line-height:1.55;color:#475569;">
            Thanks for signing up for convaire. Confirm this email address to finish setting up your account.
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding:20px 28px 8px 28px;">
          <a href="${safeUrl}"
             style="display:inline-block;padding:11px 18px;background:#0f172a;color:#ffffff;text-decoration:none;font-size:14px;font-weight:500;border-radius:8px;">
            Verify email
          </a>
        </td>
      </tr>
      <tr>
        <td style="padding:16px 28px 28px 28px;">
          <p style="margin:0;font-size:12px;line-height:1.5;color:#64748b;">
            Or paste this URL into your browser:<br/>
            <span style="word-break:break-all;color:#334155;">${safeUrl}</span>
          </p>
          <p style="margin:16px 0 0;font-size:12px;color:#94a3b8;">
            This link expires in 24 hours. If you did not create an account, you can safely ignore this email.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { subject, html, text };
}

export async function sendVerificationEmail(
  email: string,
  rawToken: string
): Promise<void> {
  const verifyUrl = publicAbsoluteUrl("/api/auth/verify-email", {
    token: rawToken,
  });
  const { subject, html, text } = buildVerificationEmail(verifyUrl);
  await sendEmail({ to: email, subject, html, text });
}

/**
 * Convenience helper: create a token and send the verification email.
 * Logs but does not throw on send failure so signup can still succeed and
 * the user can use "Resend" to retry.
 */
export async function issueAndSendVerificationEmail(
  userId: string,
  email: string
): Promise<{ sent: boolean }> {
  const token = await createVerificationToken(userId);
  try {
    await sendVerificationEmail(email, token);
    return { sent: true };
  } catch (err) {
    console.error("[email-verification] send failed", err);
    return { sent: false };
  }
}
