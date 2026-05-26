"use client";

import { useEffect, useState } from "react";
import type { DashboardAnalytics } from "@/types/analytics";
import { StatCard } from "@/components/dashboard/stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardTitle } from "@/components/ui/card";

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function AnalyticsOverview() {
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetch("/api/analytics/overview")
      .then((res) => res.json())
      .then((data: { analytics: DashboardAnalytics }) => {
        setAnalytics(data.analytics);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  if (!analytics) {
    return (
      <p className="text-sm text-zinc-500">Unable to load analytics.</p>
    );
  }

  const maxImpressions = Math.max(
    ...analytics.dailyTrend.map((d) => d.impressions),
    1,
  );

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="AOV lift"
          value={`${analytics.aovLiftPercent >= 0 ? "+" : ""}${analytics.aovLiftPercent}%`}
          hint="Accepted offers vs shown cart average"
        />
        <StatCard
          title="Recovered revenue"
          value={formatCurrency(analytics.recoveredRevenueCents)}
          hint="Sum of carts where offer was accepted"
        />
        <StatCard
          title="Offer conversion"
          value={`${analytics.conversionRatePercent}%`}
          hint={`${analytics.offersAccepted} / ${analytics.offersShown} offers accepted`}
        />
        <StatCard
          title="Active campaigns"
          value={String(analytics.activeCampaigns)}
          hint={`${analytics.impressions} total impressions`}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardTitle>Conversion with engine</CardTitle>
          <p className="mt-2 text-3xl font-semibold text-emerald-600">
            {analytics.conversionWithEnginePercent}%
          </p>
          <p className="mt-2 text-sm text-zinc-500">
            Sessions that saw or accepted an optimized offer
          </p>
        </Card>
        <Card>
          <CardTitle>Conversion without engine</CardTitle>
          <p className="mt-2 text-3xl font-semibold text-zinc-700">
            {analytics.conversionWithoutEnginePercent}%
          </p>
          <p className="mt-2 text-sm text-zinc-500">
            Baseline checkouts without campaign attribution
          </p>
        </Card>
      </div>

      <Card>
        <CardTitle>7-day performance</CardTitle>
        <div className="mt-6 flex items-end gap-3 h-40">
          {analytics.dailyTrend.length === 0 ? (
            <p className="text-sm text-zinc-500">No events yet.</p>
          ) : (
            analytics.dailyTrend.map((day) => (
              <div key={day.date} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex w-full items-end justify-center gap-1 h-28">
                  <div
                    className="w-3 rounded-t bg-indigo-200"
                    style={{
                      height: `${(day.impressions / maxImpressions) * 100}%`,
                    }}
                    title={`Impressions: ${day.impressions}`}
                  />
                  <div
                    className="w-3 rounded-t bg-indigo-600"
                    style={{
                      height: `${(day.accepted / maxImpressions) * 100}%`,
                    }}
                    title={`Accepted: ${day.accepted}`}
                  />
                </div>
                <span className="text-[10px] text-zinc-500">
                  {day.date.slice(5)}
                </span>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
