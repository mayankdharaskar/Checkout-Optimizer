import type { Campaign, Offer } from "@/generated/prisma/client";
import type { CampaignWithOffer } from "@/types/campaign";
import { parseOfferPayload } from "@/types/offer";
import { parseGeoCountries } from "@/lib/utils";

type CampaignWithOfferRecord = Campaign & { offer: Offer };

export function toCampaignWithOffer(
  record: CampaignWithOfferRecord,
): CampaignWithOffer {
  const payload = parseOfferPayload(record.offer.type, record.offer.payloadJson);

  return {
    id: record.id,
    storeId: record.storeId,
    name: record.name,
    status: record.status,
    priority: record.priority,
    minCartCents: record.minCartCents,
    maxCartCents: record.maxCartCents,
    geoCountries: parseGeoCountries(record.geoCountries),
    triggerType: record.triggerType,
    idleSeconds: record.idleSeconds,
    marginFloorPercent: record.marginFloorPercent,
    startsAt: record.startsAt?.toISOString() ?? null,
    endsAt: record.endsAt?.toISOString() ?? null,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    offer: {
      id: record.offer.id,
      type: record.offer.type,
      title: record.offer.title,
      description: record.offer.description,
      ctaLabel: record.offer.ctaLabel,
      payload,
    },
  };
}
