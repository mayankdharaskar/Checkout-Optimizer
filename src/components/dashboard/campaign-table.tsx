"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { CampaignWithOffer } from "@/types/campaign";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function CampaignTable() {
  const [campaigns, setCampaigns] = useState<CampaignWithOffer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetch("/api/campaigns")
      .then((res) => res.json())
      .then((data: { campaigns: CampaignWithOffer[] }) => {
        setCampaigns(data.campaigns ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this campaign?")) return;
    await fetch(`/api/campaigns/${id}`, { method: "DELETE" });
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
  }

  if (loading) return <Skeleton className="h-64 w-full" />;

  if (campaigns.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-300 p-12 text-center">
        <p className="text-zinc-600">No campaigns yet.</p>
        <Link href="/dashboard/campaigns/new" className="mt-4 inline-block">
          <Button>Create your first campaign</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-zinc-50 text-zinc-500">
          <tr>
            <th className="px-4 py-3 font-medium">Name</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Trigger</th>
            <th className="px-4 py-3 font-medium">Cart range</th>
            <th className="px-4 py-3 font-medium">Offer</th>
            <th className="px-4 py-3 font-medium" />
          </tr>
        </thead>
        <tbody>
          {campaigns.map((campaign) => (
            <tr key={campaign.id} className="border-t border-zinc-100">
              <td className="px-4 py-3 font-medium text-zinc-900">
                {campaign.name}
              </td>
              <td className="px-4 py-3">
                <Badge
                  tone={
                    campaign.status === "ACTIVE" ? "success" : "default"
                  }
                >
                  {campaign.status}
                </Badge>
              </td>
              <td className="px-4 py-3 text-zinc-600">
                {campaign.triggerType}
                {campaign.idleSeconds
                  ? ` (${campaign.idleSeconds}s)`
                  : ""}
              </td>
              <td className="px-4 py-3 text-zinc-600">
                ${(campaign.minCartCents / 100).toFixed(0)}
                {campaign.maxCartCents
                  ? ` – $${(campaign.maxCartCents / 100).toFixed(0)}`
                  : "+"}
              </td>
              <td className="px-4 py-3 text-zinc-600">
                {campaign.offer.title}
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end gap-2">
                  <Link href={`/dashboard/campaigns/${campaign.id}/edit`}>
                    <Button variant="secondary">Edit</Button>
                  </Link>
                  <Button
                    variant="danger"
                    onClick={() => void handleDelete(campaign.id)}
                  >
                    Delete
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
