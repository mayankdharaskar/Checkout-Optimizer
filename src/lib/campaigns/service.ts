import { prisma } from "@/lib/prisma";
import { toCampaignWithOffer } from "@/lib/mappers/campaign";
import type { CreateCampaignBody, UpdateCampaignBody } from "@/lib/validators/campaign";
import type { CampaignWithOffer } from "@/types/campaign";
import type { OfferType } from "@/types/enums";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function listCampaigns(storeId: string): Promise<CampaignWithOffer[]> {
  const rows = await prisma.campaign.findMany({
    where: { storeId },
    include: { offer: true },
    orderBy: [{ priority: "desc" }, { updatedAt: "desc" }],
  });
  return rows.map(toCampaignWithOffer);
}

export async function getCampaign(
  storeId: string,
  campaignId: string,
): Promise<CampaignWithOffer | null> {
  const row = await prisma.campaign.findFirst({
    where: { id: campaignId, storeId },
    include: { offer: true },
  });
  return row ? toCampaignWithOffer(row) : null;
}

export async function createCampaign(
  storeId: string,
  body: CreateCampaignBody,
): Promise<CampaignWithOffer> {
  const offer = await prisma.offer.create({
    data: {
      storeId,
      type: body.offer.type as OfferType,
      title: body.offer.title,
      description: body.offer.description,
      ctaLabel: body.offer.ctaLabel ?? "Apply offer",
      payloadJson: JSON.stringify(body.offer.payload),
      maxRedemptionsPerSession: body.offer.maxRedemptionsPerSession ?? 1,
    },
  });

  const campaign = await prisma.campaign.create({
    data: {
      storeId,
      name: body.name,
      status: body.status ?? "DRAFT",
      priority: body.priority ?? 0,
      minCartCents: body.minCartCents ?? 0,
      maxCartCents: body.maxCartCents ?? null,
      geoCountries: JSON.stringify(body.geoCountries ?? []),
      triggerType: body.triggerType,
      idleSeconds: body.idleSeconds ?? null,
      marginFloorPercent: body.marginFloorPercent ?? null,
      startsAt: body.startsAt ? new Date(body.startsAt) : null,
      endsAt: body.endsAt ? new Date(body.endsAt) : null,
      offerId: offer.id,
    },
    include: { offer: true },
  });

  return toCampaignWithOffer(campaign);
}

export async function updateCampaign(
  storeId: string,
  campaignId: string,
  body: UpdateCampaignBody,
): Promise<CampaignWithOffer | null> {
  const existing = await prisma.campaign.findFirst({
    where: { id: campaignId, storeId },
    include: { offer: true },
  });
  if (!existing) return null;

  if (body.offer) {
    await prisma.offer.update({
      where: { id: existing.offerId },
      data: {
        type: body.offer.type as OfferType,
        title: body.offer.title,
        description: body.offer.description,
        ctaLabel: body.offer.ctaLabel ?? existing.offer.ctaLabel,
        payloadJson: JSON.stringify(body.offer.payload),
        maxRedemptionsPerSession:
          body.offer.maxRedemptionsPerSession ??
          existing.offer.maxRedemptionsPerSession,
      },
    });
  }

  const campaign = await prisma.campaign.update({
    where: { id: campaignId },
    data: {
      name: body.name,
      status: body.status,
      priority: body.priority,
      minCartCents: body.minCartCents,
      maxCartCents: body.maxCartCents,
      geoCountries:
        body.geoCountries !== undefined
          ? JSON.stringify(body.geoCountries)
          : undefined,
      triggerType: body.triggerType,
      idleSeconds: body.idleSeconds,
      marginFloorPercent: body.marginFloorPercent,
      startsAt:
        body.startsAt !== undefined
          ? body.startsAt
            ? new Date(body.startsAt)
            : null
          : undefined,
      endsAt:
        body.endsAt !== undefined
          ? body.endsAt
            ? new Date(body.endsAt)
            : null
          : undefined,
    },
    include: { offer: true },
  });

  return toCampaignWithOffer(campaign);
}

export async function deleteCampaign(
  storeId: string,
  campaignId: string,
): Promise<boolean> {
  const existing = await prisma.campaign.findFirst({
    where: { id: campaignId, storeId },
  });
  if (!existing) return false;

  await prisma.campaign.delete({ where: { id: campaignId } });
  await prisma.offer.delete({ where: { id: existing.offerId } });
  return true;
}

export { slugify };
