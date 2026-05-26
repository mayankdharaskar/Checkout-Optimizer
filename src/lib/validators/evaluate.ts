import { z } from "zod";
import { TRIGGER_TYPES } from "@/types/enums";

export const evaluateRequestSchema = z.object({
  sessionId: z.string().min(1).max(128),
  trigger: z.enum(TRIGGER_TYPES),
  cartTotalCents: z.number().int().min(0),
  currency: z.string().length(3).optional(),
  country: z.string().length(2),
  durationOnPageMs: z.number().int().min(0),
  items: z
    .array(
      z.object({
        sku: z.string(),
        qty: z.number().int().min(1),
        priceCents: z.number().int().min(0),
      }),
    )
    .optional(),
});

export type EvaluateRequestBody = z.infer<typeof evaluateRequestSchema>;
