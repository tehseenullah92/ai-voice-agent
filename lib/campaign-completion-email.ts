import { sendEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { publicAbsoluteUrl } from "@/lib/public-app-url";

type CampaignStats = {
  totalContacts: number;
  callsPlaced: number;
  completed: number;
  failed: number;
  noAnswer: number;
  busy: number;
  canceled: number;
  other: number;
  totalDurationSec: number;
  averageDurationSec: number;
  answerRatePct: number;
  creditsUsed: number;
};

function formatDuration(totalSec: number): string {
  if (!Number.isFinite(totalSec) || totalSec <= 0) return "0s";
  const sec = Math.round(totalSec);
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function formatDateTime(d: Date | null | undefined): string {
  if (!d) return "—";
  return d.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function loadStats(campaignId: string): Promise<CampaignStats> {
  const [totalContacts, callRows, statusGroups, durationAgg] =
    await Promise.all([
      prisma.contact.count({ where: { campaignId } }),
      prisma.call.findMany({
        where: { campaignId },
        select: { id: true },
      }),
      prisma.call.groupBy({
        by: ["status"],
        where: { campaignId },
        _count: { _all: true },
      }),
      prisma.call.aggregate({
        where: { campaignId, duration: { not: null } },
        _sum: { duration: true },
        _avg: { duration: true },
      }),
    ]);

  const callsPlaced = callRows.length;
  const callIds = callRows.map((c) => c.id);
  const creditsAgg = callIds.length
    ? await prisma.creditTransaction.aggregate({
        where: { type: "call_usage", callId: { in: callIds } },
        _sum: { amount: true },
      })
    : { _sum: { amount: 0 } };

  const counts: Record<string, number> = {};
  for (const row of statusGroups) {
    counts[row.status.toLowerCase()] = row._count._all;
  }
  const completed = counts["completed"] ?? 0;
  const failed = counts["failed"] ?? 0;
  const noAnswer = counts["no-answer"] ?? 0;
  const busy = counts["busy"] ?? 0;
  const canceled = counts["canceled"] ?? 0;
  const known = completed + failed + noAnswer + busy + canceled;
  const other = Math.max(0, callsPlaced - known);

  const totalDurationSec = durationAgg._sum.duration ?? 0;
  const averageDurationSec = Math.round(durationAgg._avg.duration ?? 0);
  const answerRatePct =
    callsPlaced > 0 ? Math.round((completed / callsPlaced) * 100) : 0;
  const creditsUsed = Math.abs(creditsAgg._sum.amount ?? 0);

  return {
    totalContacts,
    callsPlaced,
    completed,
    failed,
    noAnswer,
    busy,
    canceled,
    other,
    totalDurationSec,
    averageDurationSec,
    answerRatePct,
    creditsUsed,
  };
}

function buildEmailBodies(opts: {
  campaignName: string;
  campaignType: string | null;
  startedAt: Date | null;
  completedAt: Date;
  stats: CampaignStats;
  campaignUrl: string;
}): { subject: string; html: string; text: string } {
  const { campaignName, campaignType, startedAt, completedAt, stats, campaignUrl } =
    opts;

  const subject = `Campaign completed — ${campaignName}`;

  const safeName = escapeHtml(campaignName);
  const safeType = campaignType ? escapeHtml(campaignType) : null;
  const safeUrl = escapeHtml(campaignUrl);
  const startedLabel = formatDateTime(startedAt);
  const completedLabel = formatDateTime(completedAt);

  const text = [
    `Your campaign "${campaignName}" has finished.`,
    "",
    safeType ? `Type:        ${campaignType}` : null,
    `Started:     ${startedLabel}`,
    `Completed:   ${completedLabel}`,
    "",
    `Contacts:    ${stats.totalContacts}`,
    `Calls placed:${stats.callsPlaced}`,
    `Completed:   ${stats.completed}`,
    `Failed:      ${stats.failed}`,
    `No answer:   ${stats.noAnswer}`,
    `Busy:        ${stats.busy}`,
    `Canceled:    ${stats.canceled}`,
    stats.other > 0 ? `Other:       ${stats.other}` : null,
    "",
    `Answer rate: ${stats.answerRatePct}%`,
    `Total time:  ${formatDuration(stats.totalDurationSec)}`,
    `Avg call:    ${formatDuration(stats.averageDurationSec)}`,
    `Credits used:${stats.creditsUsed}`,
    "",
    `View campaign: ${campaignUrl}`,
  ]
    .filter((line): line is string => line !== null)
    .join("\n");

  const row = (label: string, value: string) => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #eef2f7;font-size:13px;color:#475569;">${label}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eef2f7;font-size:13px;color:#0f172a;text-align:right;font-variant-numeric:tabular-nums;">${value}</td>
    </tr>`;

  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:#f6f6f7;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#0f172a;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden;">
      <tr>
        <td style="padding:24px 24px 8px 24px;">
          <p style="margin:0;font-size:11px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#64748b;">Campaign completed</p>
          <h1 style="margin:6px 0 0;font-size:20px;line-height:1.3;font-weight:600;">${safeName}</h1>
          ${safeType ? `<p style="margin:4px 0 0;font-size:13px;color:#64748b;">${safeType}</p>` : ""}
        </td>
      </tr>

      <tr>
        <td style="padding:8px 24px 4px 24px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px;">
            <tr>
              <td style="width:50%;padding:10px 12px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;">
                <div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.08em;">Answer rate</div>
                <div style="font-size:22px;font-weight:600;color:#0f172a;margin-top:2px;">${stats.answerRatePct}%</div>
              </td>
              <td style="width:8px;"></td>
              <td style="width:50%;padding:10px 12px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;">
                <div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.08em;">Calls placed</div>
                <div style="font-size:22px;font-weight:600;color:#0f172a;margin-top:2px;">${stats.callsPlaced}</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <tr>
        <td style="padding:14px 24px 4px 24px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">
            ${row("Contacts", String(stats.totalContacts))}
            ${row("Completed", String(stats.completed))}
            ${row("Failed", String(stats.failed))}
            ${row("No answer", String(stats.noAnswer))}
            ${row("Busy", String(stats.busy))}
            ${row("Canceled", String(stats.canceled))}
            ${stats.other > 0 ? row("Other", String(stats.other)) : ""}
            ${row("Total talk time", formatDuration(stats.totalDurationSec))}
            ${row("Avg call length", formatDuration(stats.averageDurationSec))}
            ${row("Credits used", String(stats.creditsUsed))}
            ${row("Started", escapeHtml(startedLabel))}
            ${row("Completed", escapeHtml(completedLabel))}
          </table>
        </td>
      </tr>

      <tr>
        <td style="padding:18px 24px 24px 24px;">
          <a href="${safeUrl}"
             style="display:inline-block;padding:10px 16px;background:#0f172a;color:#ffffff;text-decoration:none;font-size:13px;font-weight:500;border-radius:8px;">
            View campaign
          </a>
          <p style="margin:14px 0 0;font-size:11px;color:#94a3b8;">
            You're getting this email because a campaign in your convaire workspace finished running.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { subject, html, text };
}

/**
 * Sends a "campaign completed" email with stats to the workspace owner.
 * Idempotent at the caller side: only invoke once per active->completed
 * transition (see {@link maybeMarkCampaignCompleted}).
 *
 * Skipped silently when the campaign placed zero calls (e.g. launched with no
 * contacts) — the user already saw an empty result in the launch response.
 */
export async function sendCampaignCompletedEmail(
  campaignId: string
): Promise<void> {
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    select: {
      id: true,
      name: true,
      type: true,
      startAt: true,
      createdAt: true,
      workspace: {
        select: {
          user: { select: { email: true, emailVerifiedAt: true } },
        },
      },
    },
  });

  const recipient = campaign?.workspace?.user?.email;
  if (!campaign || !recipient) return;
  // Don't email un-verified users — same gate we apply elsewhere.
  if (!campaign.workspace.user.emailVerifiedAt) return;

  const stats = await loadStats(campaign.id);
  if (stats.callsPlaced === 0) return;

  const campaignUrl = publicAbsoluteUrl(`/dashboard/campaigns/${campaign.id}`);

  const { subject, html, text } = buildEmailBodies({
    campaignName: campaign.name,
    campaignType: campaign.type,
    startedAt: campaign.startAt ?? campaign.createdAt,
    completedAt: new Date(),
    stats,
    campaignUrl,
  });

  await sendEmail({ to: recipient, subject, html, text });
}
