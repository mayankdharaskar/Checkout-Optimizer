import { prisma } from "@/lib/prisma";
import type { DashboardAnalytics } from "@/types/analytics";

function percent(numerator: number, denominator: number): number {
  if (denominator === 0) return 0;
  return Math.round((numerator / denominator) * 1000) / 10;
}

export async function getDashboardAnalytics(
  storeId: string,
): Promise<DashboardAnalytics> {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [
    impressions,
    offersShown,
    offersAccepted,
    acceptedWithCart,
    completedWithCampaign,
    completedWithoutCampaign,
    shownWithCart,
    activeCampaigns,
    recentEvents,
  ] = await Promise.all([
    prisma.analyticsEvent.count({
      where: { storeId, eventType: "IMPRESSION" },
    }),
    prisma.analyticsEvent.count({
      where: { storeId, eventType: "OFFER_SHOWN" },
    }),
    prisma.analyticsEvent.count({
      where: { storeId, eventType: "OFFER_ACCEPTED" },
    }),
    prisma.analyticsEvent.findMany({
      where: {
        storeId,
        eventType: "OFFER_ACCEPTED",
        cartCents: { not: null },
      },
      select: { cartCents: true },
    }),
    prisma.analyticsEvent.count({
      where: {
        storeId,
        eventType: "CHECKOUT_COMPLETED",
        campaignId: { not: null },
      },
    }),
    prisma.analyticsEvent.count({
      where: {
        storeId,
        eventType: "CHECKOUT_COMPLETED",
        campaignId: null,
      },
    }),
    prisma.analyticsEvent.findMany({
      where: {
        storeId,
        eventType: "OFFER_SHOWN",
        cartCents: { not: null },
      },
      select: { cartCents: true },
    }),
    prisma.campaign.count({
      where: { storeId, status: "ACTIVE" },
    }),
    prisma.analyticsEvent.findMany({
      where: { storeId, createdAt: { gte: sevenDaysAgo } },
      select: { eventType: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const avgAcceptedCart =
    acceptedWithCart.length > 0
      ? acceptedWithCart.reduce((s, e) => s + (e.cartCents ?? 0), 0) /
        acceptedWithCart.length
      : 0;

  const avgShownCart =
    shownWithCart.length > 0
      ? shownWithCart.reduce((s, e) => s + (e.cartCents ?? 0), 0) /
        shownWithCart.length
      : 0;

  const aovLiftPercent =
    avgShownCart > 0
      ? Math.round(((avgAcceptedCart - avgShownCart) / avgShownCart) * 1000) /
        10
      : 0;

  const recoveredRevenueCents = acceptedWithCart.reduce(
    (s, e) => s + (e.cartCents ?? 0),
    0,
  );

  const conversionRatePercent = percent(offersAccepted, offersShown);

  const withTotal = completedWithCampaign + offersAccepted;
  const withoutTotal = completedWithoutCampaign + (offersShown - offersAccepted);

  const dailyMap = new Map<string, { impressions: number; accepted: number }>();

  for (const event of recentEvents) {
    const date = event.createdAt.toISOString().slice(0, 10);
    const entry = dailyMap.get(date) ?? { impressions: 0, accepted: 0 };
    if (event.eventType === "IMPRESSION" || event.eventType === "OFFER_SHOWN") {
      entry.impressions += 1;
    }
    if (event.eventType === "OFFER_ACCEPTED") {
      entry.accepted += 1;
    }
    dailyMap.set(date, entry);
  }

  const dailyTrend = Array.from(dailyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, stats]) => ({
      date,
      impressions: stats.impressions,
      accepted: stats.accepted,
    }));

  return {
    aovLiftPercent,
    recoveredRevenueCents,
    conversionRatePercent,
    conversionWithEnginePercent: percent(
      completedWithCampaign + offersAccepted,
      withTotal + withoutTotal || 1,
    ),
    conversionWithoutEnginePercent: percent(
      completedWithoutCampaign,
      withTotal + withoutTotal || 1,
    ),
    impressions,
    offersShown,
    offersAccepted,
    activeCampaigns,
    dailyTrend,
  };
}
