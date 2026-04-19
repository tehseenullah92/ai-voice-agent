import nodemailer, { Transporter } from "nodemailer";

type SmtpConfig = {
  host: string;
  port: number;
  user: string;
  pass: string;
  fromEmail: string;
  fromName: string;
};

function readSmtpConfig(): SmtpConfig {
  const host = process.env.SMTP_HOST?.trim();
  const portRaw = process.env.SMTP_PORT?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS;
  const fromEmail =
    process.env.SMTP_FROM_EMAIL?.trim() || user || "";
  const fromName = process.env.SMTP_FROM_NAME?.trim() || "";

  if (!host || !portRaw || !user || !pass || !fromEmail) {
    throw new Error(
      "SMTP is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM_EMAIL."
    );
  }

  const port = Number(portRaw);
  if (!Number.isFinite(port) || port <= 0) {
    throw new Error(`Invalid SMTP_PORT: "${portRaw}"`);
  }

  return { host, port, user, pass, fromEmail, fromName };
}

let cachedTransporter: Transporter | null = null;
let cachedFrom: string | null = null;

function getTransporter(): { transporter: Transporter; from: string } {
  if (cachedTransporter && cachedFrom) {
    return { transporter: cachedTransporter, from: cachedFrom };
  }
  const cfg = readSmtpConfig();
  cachedTransporter = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    // Common convention: 465 = implicit TLS, otherwise STARTTLS.
    secure: cfg.port === 465,
    auth: { user: cfg.user, pass: cfg.pass },
  });
  cachedFrom = cfg.fromName
    ? `"${cfg.fromName}" <${cfg.fromEmail}>`
    : cfg.fromEmail;
  return { transporter: cachedTransporter, from: cachedFrom };
}

export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

export async function sendEmail(input: SendEmailInput): Promise<void> {
  const { transporter, from } = getTransporter();
  await transporter.sendMail({
    from,
    to: input.to,
    subject: input.subject,
    text: input.text,
    html: input.html,
  });
}
