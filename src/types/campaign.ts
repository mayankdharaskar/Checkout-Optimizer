import type { CampaignStatus, TriggerType } from "./enums";
import type { OfferResponse } from "./offer";

export type CampaignWithOffer = {
  id: string;
  storeId: string;
  name: string;
  status: CampaignStatus;
  priority: number;
  minCartCents: number;
  maxCartCents: number | null;
  geoCountries: string[];
  triggerType: TriggerType;
  idleSeconds: number | null;
  marginFloorPercent: number | null;
  startsAt: string | null;
  endsAt: string | null;
  createdAt: string;
  updatedAt: string;
  offer: OfferResponse;
};

export type CreateCampaignInput = {
  name: string;
  status?: CampaignStatus;
  priority?: number;
  minCartCents?: number;
  maxCartCents?: number | null;
  geoCountries?: string[];
  triggerType: TriggerType;
  idleSeconds?: number | null;
  marginFloorPercent?: number | null;
  startsAt?: string | null;
  endsAt?: string | null;
  offer: {
    type: OfferResponse["type"];
    title: string;
    description: string;
    ctaLabel?: string;
    payload: Omit<OfferResponse["payload"], "type"> extends never
      ? never
      : Record<string, unknown>;
    maxRedemptionsPerSession?: number;
  };
};

export type UpdateCampaignInput = Partial<
  Omit<CreateCampaignInput, "offer">
> & {
  offer?: CreateCampaignInput["offer"];
};
