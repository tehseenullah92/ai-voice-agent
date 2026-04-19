export const CAMPAIGN_TYPES = [
  "Outbound Sales",
  "Appointment Reminder",
  "Survey / Feedback",
  "Hiring Screen",
  "Custom",
] as const;

export type CampaignType = (typeof CAMPAIGN_TYPES)[number];

/** Coerce arbitrary stored type string to a wizard option (unknown → Custom). */
export function normalizeCampaignType(type: string): CampaignType {
  return (CAMPAIGN_TYPES as readonly string[]).includes(type)
    ? (type as CampaignType)
    : "Custom";
}

export const VOICE_OPTIONS = [
  { id: "calm-male", label: "Calm Male" },
  { id: "warm-female", label: "Warm Female" },
  { id: "neutral-male", label: "Neutral Male" },
  { id: "energetic-female", label: "Energetic Female" },
] as const;

export type VoiceId = (typeof VOICE_OPTIONS)[number]["id"];

export function voiceLabelFromId(voiceId: VoiceId | ""): string {
  if (!voiceId) return "Warm Female";
  return (
    VOICE_OPTIONS.find((v) => v.id === voiceId)?.label ?? "Warm Female"
  );
}

/** Map stored DB value (label or legacy id) back to wizard voice id. */
export function voiceIdFromStored(agentVoice: string | null | undefined): VoiceId | "" {
  if (!agentVoice) return "";
  const byLabel = VOICE_OPTIONS.find((v) => v.label === agentVoice);
  if (byLabel) return byLabel.id;
  const byId = VOICE_OPTIONS.find((v) => v.id === agentVoice);
  if (byId) return byId.id;
  return "";
}

/** Local datetime-local value from ISO or Date (for editing). */
export function isoToDatetimeLocal(iso: string | Date | null | undefined): string {
  if (!iso) {
    const start = new Date();
    start.setMinutes(0, 0, 0);
    start.setDate(start.getDate() + 1);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}T${pad(start.getHours())}:${pad(start.getMinutes())}`;
  }
  const d = typeof iso === "string" ? new Date(iso) : iso;
  if (Number.isNaN(d.getTime())) {
    return isoToDatetimeLocal(null);
  }
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export const COMMON_TIMEZONES = [
  { value: "America/New_York", label: "Eastern (US)" },
  { value: "America/Chicago", label: "Central (US)" },
  { value: "America/Denver", label: "Mountain (US)" },
  { value: "America/Los_Angeles", label: "Pacific (US)" },
  { value: "America/Phoenix", label: "Arizona" },
  { value: "UTC", label: "UTC" },
  { value: "Europe/London", label: "London" },
  { value: "Europe/Paris", label: "Paris" },
  { value: "Asia/Tokyo", label: "Tokyo" },
  { value: "Australia/Sydney", label: "Sydney" },
] as const;

export type ContactRow = Record<string, string>;

export type CampaignWizardState = {
  basics: {
    name: string;
    type: CampaignType | "";
    description: string;
    /** Empty string = use workspace default caller ID */
    fromPhoneNumber: string;
  };
  contacts: {
    headers: string[];
    rows: ContactRow[];
    phoneColumn: string | null;
    fileName: string | null;
  };
  agent: {
    name: string;
    voiceId: VoiceId | "";
    openingLine: string;
    goal: string;
    maxDurationMinutes: number;
  };
  schedule: {
    /** ISO string for datetime-local round-trip */
    startLocal: string;
    callingFrom: string;
    callingTo: string;
    timezone: string;
    callsPerHour: number;
    stopWhenAllReached: boolean;
  };
};

export const initialCampaignWizardState = (): CampaignWizardState => {
  const start = new Date();
  start.setMinutes(0, 0, 0);
  start.setDate(start.getDate() + 1);
  const pad = (n: number) => String(n).padStart(2, "0");
  const local =
    `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}T${pad(start.getHours())}:${pad(start.getMinutes())}`;

  return {
    basics: { name: "", type: "", description: "", fromPhoneNumber: "" },
    contacts: { headers: [], rows: [], phoneColumn: null, fileName: null },
    agent: {
      name: "",
      voiceId: "",
      openingLine: "",
      goal: "",
      maxDurationMinutes: 5,
    },
    schedule: {
      startLocal: local,
      callingFrom: "09:00",
      callingTo: "18:00",
      timezone: "America/New_York",
      callsPerHour: 60,
      stopWhenAllReached: true,
    },
  };
};
