import type { TriggerType } from "./enums";
import type { OfferResponse } from "./offer";

export type EvaluateRequest = {
  sessionId: string;
  trigger: TriggerType;
  cartTotalCents: number;
  currency?: string;
  country: string;
  durationOnPageMs: number;
  items?: {
    sku: string;
    qty: number;
    priceCents: number;
  }[];
};

export type EvaluateResponse = {
  matched: boolean;
  campaignId?: string;
  offer?: OfferResponse & {
    frameUrl: string;
  };
};
