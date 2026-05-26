import { z } from "zod";
import { OFFER_TYPES } from "@/types/enums";

const shippingPayloadSchema = z.object({
  discountCents: z.number().int().min(0),
  minCartCents: z.number().int().min(0).optional(),
});

const giftPayloadSchema = z.object({
  sku: z.string().min(1),
  giftTitle: z.string().min(1),
});

const fixedDiscountPayloadSchema = z.object({
  discountCents: z.number().int().min(0),
  couponCode: z.string().optional(),
});

const expressPayloadSchema = z.object({
  upgradeLabel: z.string().min(1),
});

export const offerInputSchema = z
  .object({
    type: z.enum(OFFER_TYPES),
    title: z.string().min(1).max(120),
    description: z.string().min(1).max(500),
    ctaLabel: z.string().min(1).max(40).optional(),
    maxRedemptionsPerSession: z.number().int().min(1).max(10).optional(),
    payload: z.record(z.unknown()),
  })
  .superRefine((data, ctx) => {
    let result: z.SafeParseReturnType<unknown, unknown>;
    switch (data.type) {
      case "SHIPPING_DISCOUNT":
        result = shippingPayloadSchema.safeParse(data.payload);
        break;
      case "FREE_GIFT_SKU":
        result = giftPayloadSchema.safeParse(data.payload);
        break;
      case "FIXED_DISCOUNT":
        result = fixedDiscountPayloadSchema.safeParse(data.payload);
        break;
      case "EXPRESS_SHIPPING_UPGRADE":
        result = expressPayloadSchema.safeParse(data.payload);
        break;
      default:
        return;
    }
    if (!result.success) {
      result.error.issues.forEach((issue) => {
        ctx.addIssue({
          ...issue,
          path: ["payload", ...issue.path],
        });
      });
    }
  });

export type OfferInput = z.infer<typeof offerInputSchema>;
