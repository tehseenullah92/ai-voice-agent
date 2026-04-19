import type { Campaign, Workspace } from "@prisma/client";

import type { TwilioIncomingEntry } from "@/lib/twilio-incoming";

export function parseIncomingNumbers(
  workspace: Pick<Workspace, "twilioIncomingNumbers" | "twilioNumber">
): TwilioIncomingEntry[] {
  const raw = workspace.twilioIncomingNumbers;
  if (raw && Array.isArray(raw)) {
    return raw as TwilioIncomingEntry[];
  }
  if (workspace.twilioNumber?.trim()) {
    return [
      {
        sid: "",
        phoneNumber: workspace.twilioNumber.trim(),
        friendlyName: null,
      },
    ];
  }
  return [];
}

export function allowedFromNumbers(
  workspace: Pick<Workspace, "twilioIncomingNumbers" | "twilioNumber">
): Set<string> {
  const set = new Set<string>();
  for (const n of parseIncomingNumbers(workspace)) {
    if (n.phoneNumber?.trim()) set.add(n.phoneNumber.trim());
  }
  if (workspace.twilioNumber?.trim()) {
    set.add(workspace.twilioNumber.trim());
  }
  return set;
}

/** Credentials + default outbound number present (legacy / minimal config). */
export function isTwilioOutboundReady(
  workspace: Pick<Workspace, "twilioSid" | "twilioToken" | "twilioNumber">
): boolean {
  return Boolean(
    workspace.twilioSid?.trim() &&
      workspace.twilioToken?.trim() &&
      workspace.twilioNumber?.trim()
  );
}

/**
 * Returns the E.164 from-number to use for Twilio Calls API, or null if not callable.
 */
export function resolveOutboundFromNumber(
  workspace: Workspace,
  campaign: Pick<Campaign, "fromPhoneNumber">
): string | null {
  if (!isTwilioOutboundReady(workspace)) return null;

  const allowed = allowedFromNumbers(workspace);
  const chosen = (campaign.fromPhoneNumber ?? workspace.twilioNumber)?.trim();
  if (!chosen || !allowed.has(chosen)) return null;
  return chosen;
}

export function assertFromNumberAllowed(
  workspace: Pick<Workspace, "twilioIncomingNumbers" | "twilioNumber">,
  phone: string | null | undefined
): boolean {
  if (phone === null || phone === undefined || phone === "") return true;
  const trimmed = phone.trim();
  if (!trimmed) return true;
  return allowedFromNumbers(workspace).has(trimmed);
}
