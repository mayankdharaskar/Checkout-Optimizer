import type { Campaign, Offer, Store } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { EvaluateRequestBody } from "@/lib/validators/evaluate";
import type { EvaluateResponse } from "@/types/engine";
import { parseOfferPayload } from "@/types/offer";
import {
  matchesCartRange,
  matchesGeo,
  matchesTrigger,
  passesMarginFloor,
} from "./guards";
import { totalCampaignScore } from "./scoring";

type CampaignWithOffer = Campaign & { offer: Offer };

function buildFrameUrl(
  baseUrl: string,
  store: Store,
  campaign: CampaignWithOffer,
): string {
  const params = new URLSearchParams({
    campaignId: campaign.id,
    offerId: campaign.offer.id,
    storeKey: store.publicKey,
    title: campaign.offer.title,
    description: campaign.offer.description,
    cta: campaign.offer.ctaLabel,
    type: campaign.offer.type,
  });
  return `${baseUrl}/widget/frame?${params.toString()}`;
}

export async function evaluateCampaigns(
  store: Store,
  body: EvaluateRequestBody,
): Promise<EvaluateResponse> {
  const now = new Date();

  const campaigns = await prisma.campaign.findMany({
    where: {
      storeId: store.id,
      status: "ACTIVE",
      OR: [
        { startsAt: null },
        { startsAt: { lte: now } },
      ],
      AND: [
        {
          OR: [{ endsAt: null }, { endsAt: { gte: now } }],
        },
      ],
    },
    include: { offer: true },
    orderBy: { priority: "desc" },
  });

  const eligible = campaigns.filter((campaign) => {
    if (!matchesCartRange(campaign, body.cartTotalCents)) return false;
    if (!matchesGeo(campaign, body.country)) return false;
    if (!matchesTrigger(campaign, body)) return false;
    if (!passesMarginFloor(campaign, body.cartTotalCents)) return false;
    return true;
  });

  if (eligible.length === 0) {
    return { matched: false };
  }

  const winner = eligible.reduce((best, current) => {
    const bestScore = totalCampaignScore(best, body.country);
    const currentScore = totalCampaignScore(current, body.country);
    return currentScore > bestScore ? current : best;
  });

  const payload = parseOfferPayload(winner.offer.type, winner.offer.payloadJson);
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return {
    matched: true,
    campaignId: winner.id,
    offer: {
      id: winner.offer.id,
      type: winner.offer.type,
      title: winner.offer.title,
      description: winner.offer.description,
      ctaLabel: winner.offer.ctaLabel,
      payload,
      frameUrl: buildFrameUrl(appUrl, store, winner),
    },
  };
}
