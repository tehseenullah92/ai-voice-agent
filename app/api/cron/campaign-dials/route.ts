import { NextResponse } from "next/server";

import { processAllDueCampaignDialQueues } from "@/lib/campaign-dial-queue";
import { verifyQStashRequest } from "@/lib/qstash";
import { isUpstashRedisConfigured } from "@/lib/upstash-redis";

export const dynamic = "force-dynamic";

/**
 * Drain Upstash-backed campaign dial queues.
 *
 * **QStash (recommended):** Create a schedule in the QStash console that POSTs (or GETs)
 * to this URL. Set `QSTASH_CURRENT_SIGNING_KEY` (and optional `QSTASH_NEXT_SIGNING_KEY`)
 * from the QStash dashboard so requests can be verified.
 *
 * **Manual / other schedulers:** `Authorization: Bearer <CRON_SECRET>` or
 * header `x-cron-secret: <CRON_SECRET>`.
 */
async function handle(request: Request, rawBody: string) {
  const sig =
    request.headers.get("upstash-signature") ??
    request.headers.get("Upstash-Signature");

  if (sig) {
    const upstashRegion =
      request.headers.get("upstash-region") ??
      request.headers.get("Upstash-Region");
    const ok = await verifyQStashRequest({
      signature: sig,
      rawBody,
      upstashRegion,
    });
    if (!ok) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } else {
    const secret = process.env.CRON_SECRET?.trim();
    const auth = request.headers.get("authorization") ?? "";
    const cronOk =
      secret &&
      (auth === `Bearer ${secret}` ||
        request.headers.get("x-cron-secret") === secret);

    if (!cronOk) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  if (!isUpstashRedisConfigured()) {
    return NextResponse.json({
      ok: true,
      skipped: "Upstash Redis is not configured",
    });
  }

  const result = await processAllDueCampaignDialQueues();
  return NextResponse.json({ ok: true, ...result });
}

export async function GET(request: Request) {
  return handle(request, "");
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  return handle(request, rawBody);
}
