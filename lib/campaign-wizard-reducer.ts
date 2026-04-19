import type { ContactRow } from "@/lib/campaign-wizard-types";
import {
  initialCampaignWizardState,
  type CampaignWizardState,
} from "@/lib/campaign-wizard-types";

export type CampaignWizardAction =
  | { type: "RESET" }
  | { type: "HYDRATE"; payload: CampaignWizardState }
  | { type: "SET_BASICS"; payload: Partial<CampaignWizardState["basics"]> }
  | {
      type: "SET_CSV";
      payload: {
        headers: string[];
        rows: ContactRow[];
        fileName: string | null;
      };
    }
  | { type: "SET_PHONE_COLUMN"; payload: string | null }
  | { type: "SET_AGENT"; payload: Partial<CampaignWizardState["agent"]> }
  | { type: "SET_SCHEDULE"; payload: Partial<CampaignWizardState["schedule"]> };

export function campaignWizardReducer(
  state: CampaignWizardState,
  action: CampaignWizardAction
): CampaignWizardState {
  switch (action.type) {
    case "RESET":
      return initialCampaignWizardState();
    case "HYDRATE":
      return action.payload;
    case "SET_BASICS":
      return {
        ...state,
        basics: { ...state.basics, ...action.payload },
      };
    case "SET_CSV": {
      const { headers, rows, fileName } = action.payload;
      const phoneGuess =
        headers.find((h) => /phone|mobile|tel|cell/i.test(h)) ?? null;
      return {
        ...state,
        contacts: {
          headers,
          rows,
          fileName,
          phoneColumn: phoneGuess,
        },
      };
    }
    case "SET_PHONE_COLUMN":
      return {
        ...state,
        contacts: { ...state.contacts, phoneColumn: action.payload },
      };
    case "SET_AGENT":
      return {
        ...state,
        agent: { ...state.agent, ...action.payload },
      };
    case "SET_SCHEDULE":
      return {
        ...state,
        schedule: { ...state.schedule, ...action.payload },
      };
    default:
      return state;
  }
}
