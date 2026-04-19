import { initiateCall } from "@/lib/calls";
import { prisma } from "@/lib/prisma";
import { getUpstashRedis } from "@/lib/upstash-redis";

/** Sorted set: score = due time (ms), member = contact id */
export function campaignDialZKey(campaignId: string): string {
  return `convaire:campaign:dial:z:${campaignId}`;
}

/** Set of campaign ids that may have due or future dial jobs */
const DIAL_ACTIVE_CAMPAIGNS = "convaire:campaign:dial:active";

const INITIAL_BURST = 10;
const ZADD_PIPELINE_BATCH = 100;
const PROCESS_BATCH = 40;
const RETRY_DELAY_MS = 60_000;

function intervalMsForCallsPerHour(callsPerHour: number): number {
  return 3600000 / Math.max(1, callsPerHour);
}

/**
 * Remove all scheduled dial jobs for a campaign (e.g. before re-launch).
 */
export async function clearCampaignDialQueue(campaignId: string): Promise<void> {
  const redis = getUpstashRedis();
  await redis.del(campaignDialZKey(campaignId));
  await redis.srem(DIAL_ACTIVE_CAMPAIGNS, campaignId);
}

/**
 * Stream contacts in `createdAt`, `id` order and enqueue Twilio dial times in Upstash.
 * Same pacing as legacy: first {@link INITIAL_BURST} share the same due time, then spaced by `intervalMs`.
 */
export async function scheduleCampaignDialQueue(params: {
  campaignId: string;
  callsPerHour: number;
}): Promise<{ scheduled: number }> {
  const redis = getUpstashRedis();
  const { campaignId, callsPerHour } = params;
  const intervalMs = intervalMsForCallsPerHour(callsPerHour);
  const zKey = campaignDialZKey(campaignId);

  await redis.del(zKey);

  const baseTime = Date.now();
  let index = 0;
  let last: { createdAt: Date; id: string } | null = null;

  const pipeZadd: Array<{ score: number; member: string }> = [];

  async function flushPipe() {
    if (pipeZadd.length === 0) return;
    const redisInner = getUpstashRedis();
    const p = redisInner.pipeline();
    for (const row of pipeZadd) {
      p.zadd(zKey, { score: row.score, member: row.member });
    }
    await p.exec();
    pipeZadd.length = 0;
  }

  for (;;) {
    const batch: Array<{ id: string; createdAt: Date }> = await prisma.contact.findMany({
      where: {
        campaignId,
        status: "pending",
        ...(last
          ? {
              OR: [
                { createdAt: { gt: last.createdAt } },
                {
                  AND: [
                    { createdAt: last.createdAt },
                    { id: { gt: last.id } },
                  ],
                },
              ],
            }
          : {}),
      },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      take: 500,
      select: { id: true, createdAt: true },
    });

    if (batch.length === 0) break;

    for (const c of batch) {
      const due =
        baseTime + Math.max(0, index - (INITIAL_BURST - 1)) * intervalMs;
      pipeZadd.push({ score: due, member: c.id });
      index += 1;
      if (pipeZadd.length >= ZADD_PIPELINE_BATCH) {
        await flushPipe();
      }
    }

    last = {
      createdAt: batch[batch.length - 1].createdAt,
      id: batch[batch.length - 1].id,
    };
  }

  await flushPipe();

  if (index > 0) {
    await redis.sadd(DIAL_ACTIVE_CAMPAIGNS, campaignId);
  }

  return { scheduled: index };
}

/**
 * Process due dial jobs for one campaign: claim members with score ≤ now, call Twilio, drop on success.
 */
export async function processDueDialsForCampaign(
  campaignId: string,
  options?: { maxCalls?: number }
): Promise<{ attempted: number; succeeded: number; requeued: number }> {
  const redis = getUpstashRedis();
  const zKey = campaignDialZKey(campaignId);
  const maxCalls = options?.maxCalls ?? PROCESS_BATCH * 4;
  const now = Date.now();

  let attempted = 0;
  let succeeded = 0;
  let requeued = 0;

  while (attempted < maxCalls) {
    const due = (await redis.zrange(
      zKey,
      "-inf",
      now,
      { byScore: true, offset: 0, count: PROCESS_BATCH }
    )) as string[];

    if (due.length === 0) break;

    for (const contactId of due) {
      if (attempted >= maxCalls) break;
      attempted += 1;

      const removed = await redis.zrem(zKey, contactId);
      if (removed === 0) continue;

      try {
        await initiateCall(campaignId, contactId);
        succeeded += 1;
      } catch (err) {
        console.error("campaign dial queue initiateCall", err);
        await redis.zadd(zKey, {
          score: Date.now() + RETRY_DELAY_MS,
          member: contactId,
        });
        requeued += 1;
      }
    }
  }

  const remaining = await redis.zcard(zKey);
  if (remaining === 0) {
    await redis.srem(DIAL_ACTIVE_CAMPAIGNS, campaignId);
  }

  return { attempted, succeeded, requeued };
}

/**
 * Cron entry: process all campaigns that may have due dials.
 */
export async function processAllDueCampaignDialQueues(options?: {
  maxCampaigns?: number;
  maxCallsPerCampaign?: number;
}): Promise<{
  campaignsTouched: number;
  totals: { attempted: number; succeeded: number; requeued: number };
}> {
  const redis = getUpstashRedis();
  const maxCampaigns = options?.maxCampaigns ?? 100;
  const maxCallsPerCampaign = options?.maxCallsPerCampaign;

  const ids = (await redis.smembers(DIAL_ACTIVE_CAMPAIGNS)) as string[];
  const slice = ids.slice(0, maxCampaigns);

  let attempted = 0;
  let succeeded = 0;
  let requeued = 0;

  for (const campaignId of slice) {
    const r = await processDueDialsForCampaign(campaignId, {
      maxCalls: maxCallsPerCampaign,
    });
    attempted += r.attempted;
    succeeded += r.succeeded;
    requeued += r.requeued;
  }

  return {
    campaignsTouched: slice.length,
    totals: { attempted, succeeded, requeued },
  };
}

/**
 * Legacy in-process scheduling for environments without Upstash (small lists; not durable on serverless).
 */
export function scheduleCampaignDialsLegacy(params: {
  campaignId: string;
  contactIds: string[];
  callsPerHour: number;
}): void {
  const { campaignId, contactIds, callsPerHour } = params;
  const intervalMs = intervalMsForCallsPerHour(callsPerHour);

  contactIds.forEach((contactId, index) => {
    if (index < INITIAL_BURST) {
      void initiateCall(campaignId, contactId).catch((err) =>
        console.error("initiateCall", err)
      );
    } else {
      const delay = (index - (INITIAL_BURST - 1)) * intervalMs;
      setTimeout(() => {
        void initiateCall(campaignId, contactId).catch((err) =>
          console.error("initiateCall", err)
        );
      }, delay);
    }
  });
}
