import { z } from "zod";
import {
  CAMPAIGN_STATUSES,
  TRIGGER_TYPES,
} from "@/types/enums";
import { offerInputSchema } from "./offer";

const campaignFieldsSchema = z.object({
  name: z.string().min(1).max(120),
  status: z.enum(CAMPAIGN_STATUSES).optional(),
  priority: z.number().int().min(0).max(1000).optional(),
  minCartCents: z.number().int().min(0).optional(),
  maxCartCents: z.number().int().min(0).nullable().optional(),
  geoCountries: z.array(z.string().length(2)).optional(),
  triggerType: z.enum(TRIGGER_TYPES),
  idleSeconds: z.number().int().min(5).max(600).nullable().optional(),
  marginFloorPercent: z.number().min(0).max(100).nullable().optional(),
  startsAt: z.string().datetime().nullable().optional(),
  endsAt: z.string().datetime().nullable().optional(),
  offer: offerInputSchema,
});

function refineCampaign(
  data: {
    triggerType: z.infer<typeof campaignFieldsSchema>["triggerType"];
    idleSeconds?: number | null;
    minCartCents?: number;
    maxCartCents?: number | null;
  },
  ctx: z.RefinementCtx,
) {
  if (data.triggerType === "IDLE_TIME" && !data.idleSeconds) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "idleSeconds is required for IDLE_TIME triggers",
      path: ["idleSeconds"],
    });
  }
  if (
    data.maxCartCents != null &&
    data.minCartCents != null &&
    data.maxCartCents < data.minCartCents
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "maxCartCents must be >= minCartCents",
      path: ["maxCartCents"],
    });
  }
}

export const createCampaignSchema =
  campaignFieldsSchema.superRefine(refineCampaign);

export const updateCampaignSchema = campaignFieldsSchema
  .partial()
  .extend({
    offer: offerInputSchema.optional(),
  })
  .superRefine((data, ctx) => {
    if (data.triggerType) {
      refineCampaign(
        {
          triggerType: data.triggerType,
          idleSeconds: data.idleSeconds,
          minCartCents: data.minCartCents,
          maxCartCents: data.maxCartCents,
        },
        ctx,
      );
    }
  });

export type CreateCampaignBody = z.infer<typeof createCampaignSchema>;
export type UpdateCampaignBody = z.infer<typeof updateCampaignSchema>;
