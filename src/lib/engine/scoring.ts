import type { Campaign } from "@/generated/prisma/client";
import { parseGeoCountries } from "@/lib/utils";

export function campaignSpecificityScore(
  campaign: Campaign,
  country: string,
): number {
  let score = 0;
  const countries = parseGeoCountries(campaign.geoCountries);
  if (countries.length > 0 && countries.includes(country.toUpperCase())) {
    score += 50;
  }

  if (campaign.maxCartCents != null) {
    const bandWidth = campaign.maxCartCents - campaign.minCartCents;
    if (bandWidth > 0 && bandWidth < 10000) {
      score += Math.max(0, 50 - Math.floor(bandWidth / 200));
    }
  }

  if (campaign.minCartCents > 0) {
    score += 10;
  }

  return score;
}

export function totalCampaignScore(
  campaign: Campaign,
  country: string,
): number {
  return campaign.priority * 1000 + campaignSpecificityScore(campaign, country);
}
