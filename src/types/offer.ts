import type { OfferType } from "./enums";

export type ShippingDiscountPayload = {
  discountCents: number;
  minCartCents?: number;
};

export type FreeGiftSkuPayload = {
  sku: string;
  giftTitle: string;
};

export type FixedDiscountPayload = {
  discountCents: number;
  couponCode?: string;
};

export type ExpressShippingUpgradePayload = {
  upgradeLabel: string;
};

export type OfferPayload =
  | ({ type: "SHIPPING_DISCOUNT" } & ShippingDiscountPayload)
  | ({ type: "FREE_GIFT_SKU" } & FreeGiftSkuPayload)
  | ({ type: "FIXED_DISCOUNT" } & FixedDiscountPayload)
  | ({ type: "EXPRESS_SHIPPING_UPGRADE" } & ExpressShippingUpgradePayload);

export type OfferResponse = {
  id: string;
  type: OfferType;
  title: string;
  description: string;
  ctaLabel: string;
  payload: OfferPayload;
};

export function parseOfferPayload(
  type: OfferType,
  payloadJson: string,
): OfferPayload {
  const raw = JSON.parse(payloadJson) as Record<string, unknown>;

  switch (type) {
    case "SHIPPING_DISCOUNT":
      return {
        type: "SHIPPING_DISCOUNT",
        discountCents: Number(raw.discountCents),
        minCartCents:
          raw.minCartCents !== undefined
            ? Number(raw.minCartCents)
            : undefined,
      };
    case "FREE_GIFT_SKU":
      return {
        type: "FREE_GIFT_SKU",
        sku: String(raw.sku),
        giftTitle: String(raw.giftTitle),
      };
    case "FIXED_DISCOUNT":
      return {
        type: "FIXED_DISCOUNT",
        discountCents: Number(raw.discountCents),
        couponCode:
          raw.couponCode !== undefined ? String(raw.couponCode) : undefined,
      };
    case "EXPRESS_SHIPPING_UPGRADE":
      return {
        type: "EXPRESS_SHIPPING_UPGRADE",
        upgradeLabel: String(raw.upgradeLabel),
      };
    default: {
      const _exhaustive: never = type;
      throw new Error(`Unknown offer type: ${String(_exhaustive)}`);
    }
  }
}

export function serializeOfferPayload(payload: OfferPayload): string {
  const { type: _type, ...rest } = payload;
  return JSON.stringify(rest);
}
