import type { Campaign, Offer } from "@/generated/prisma/client";
import type { EvaluateRequestBody } from "@/lib/validators/evaluate";
import { parseGeoCountries } from "@/lib/utils";
import { parseOfferPayload } from "@/types/offer";

type CampaignWithOffer = Campaign & { offer: Offer };

export function matchesCartRange(
  campaign: Campaign,
  cartTotalCents: number,
): boolean {
  if (cartTotalCents < campaign.minCartCents) return false;
  if (
    campaign.maxCartCents != null &&
    cartTotalCents > campaign.maxCartCents
  ) {
    return false;
  }
  return true;
}

export function matchesGeo(
  campaign: Campaign,
  country: string,
): boolean {
  const countries = parseGeoCountries(campaign.geoCountries);
  if (countries.length === 0) return true;
  return countries.includes(country.toUpperCase());
}

export function matchesTrigger(
  campaign: Campaign,
  body: EvaluateRequestBody,
): boolean {
  if (campaign.triggerType !== body.trigger) return false;

  if (campaign.triggerType === "IDLE_TIME") {
    const idleMs = (campaign.idleSeconds ?? 45) * 1000;
    return body.durationOnPageMs >= idleMs;
  }

  return true;
}

export function passesMarginFloor(
  campaign: CampaignWithOffer,
  cartTotalCents: number,
): boolean {
  if (campaign.marginFloorPercent == null || cartTotalCents <= 0) {
    return true;
  }

  const payload = parseOfferPayload(
    campaign.offer.type,
    campaign.offer.payloadJson,
  );

  let discountCents = 0;
  if (
    payload.type === "SHIPPING_DISCOUNT" ||
    payload.type === "FIXED_DISCOUNT"
  ) {
    discountCents = payload.discountCents;
  }

  if (discountCents <= 0) return true;

  const discountPercent = (discountCents / cartTotalCents) * 100;
  const maxAllowedDiscount = 100 - campaign.marginFloorPercent;
  return discountPercent <= maxAllowedDiscount;
}
