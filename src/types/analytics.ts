import type { AnalyticsEventType } from "./enums";

export type TrackEventRequest = {
  sessionId: string;
  eventType: AnalyticsEventType;
  campaignId?: string;
  offerId?: string;
  cartCents?: number;
  country?: string;
  metadata?: Record<string, string | number | boolean>;
};

export type DashboardAnalytics = {
  aovLiftPercent: number;
  recoveredRevenueCents: number;
  conversionRatePercent: number;
  conversionWithEnginePercent: number;
  conversionWithoutEnginePercent: number;
  impressions: number;
  offersShown: number;
  offersAccepted: number;
  activeCampaigns: number;
  dailyTrend: {
    date: string;
    impressions: number;
    accepted: number;
  }[];
};
