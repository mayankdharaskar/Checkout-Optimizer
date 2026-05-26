export const TRIGGER_TYPES = ["EXIT_INTENT", "IDLE_TIME"] as const;
export type TriggerType = (typeof TRIGGER_TYPES)[number];

export const OFFER_TYPES = [
  "SHIPPING_DISCOUNT",
  "FREE_GIFT_SKU",
  "FIXED_DISCOUNT",
  "EXPRESS_SHIPPING_UPGRADE",
] as const;
export type OfferType = (typeof OFFER_TYPES)[number];

export const CAMPAIGN_STATUSES = [
  "DRAFT",
  "ACTIVE",
  "PAUSED",
  "ARCHIVED",
] as const;
export type CampaignStatus = (typeof CAMPAIGN_STATUSES)[number];

export const ANALYTICS_EVENT_TYPES = [
  "IMPRESSION",
  "OFFER_SHOWN",
  "OFFER_ACCEPTED",
  "OFFER_DISMISSED",
  "CHECKOUT_COMPLETED",
  "ABANDONMENT",
] as const;
export type AnalyticsEventType = (typeof ANALYTICS_EVENT_TYPES)[number];
