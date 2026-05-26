import { z } from "zod";
import { ANALYTICS_EVENT_TYPES } from "@/types/enums";

export const trackEventSchema = z.object({
  sessionId: z.string().min(1).max(128),
  eventType: z.enum(ANALYTICS_EVENT_TYPES),
  campaignId: z.string().optional(),
  offerId: z.string().optional(),
  cartCents: z.number().int().min(0).optional(),
  country: z.string().length(2).optional(),
  metadata: z.record(z.union([z.string(), z.number(), z.boolean()])).optional(),
});

export type TrackEventBody = z.infer<typeof trackEventSchema>;
