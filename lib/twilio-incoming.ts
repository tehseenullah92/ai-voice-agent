import axios from "axios";

export type TwilioIncomingApiRow = {
  sid: string;
  phone_number: string;
  friendly_name?: string | null;
};

export type TwilioIncomingEntry = {
  sid: string;
  phoneNumber: string;
  friendlyName: string | null;
};

/**
 * List all IncomingPhoneNumber resources for an account (paginated).
 */
export async function fetchAllIncomingPhoneNumbers(
  accountSid: string,
  authToken: string
): Promise<TwilioIncomingApiRow[]> {
  const auth = { username: accountSid, password: authToken };
  const base = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/IncomingPhoneNumbers.json`;
  const collected: TwilioIncomingApiRow[] = [];
  const pageSize = 1000;

  for (let page = 0; page < 100; page++) {
    const res = await axios.get<{
      incoming_phone_numbers?: TwilioIncomingApiRow[];
    }>(base, {
      auth,
      params: { PageSize: pageSize, Page: page },
    });
    const batch = res.data.incoming_phone_numbers ?? [];
    collected.push(...batch);
    if (batch.length < pageSize) break;
  }

  return collected;
}

export function mapIncomingToEntries(
  rows: TwilioIncomingApiRow[]
): TwilioIncomingEntry[] {
  return rows.map((r) => ({
    sid: r.sid,
    phoneNumber: r.phone_number,
    friendlyName: r.friendly_name ?? null,
  }));
}
