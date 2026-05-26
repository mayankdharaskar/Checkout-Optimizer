import Link from "next/link";
import { CampaignTable } from "@/components/dashboard/campaign-table";
import { Button } from "@/components/ui/button";

export default function CampaignsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Campaigns</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Manage dynamic checkout offers and triggers.
          </p>
        </div>
        <Link href="/dashboard/campaigns/new">
          <Button>New campaign</Button>
        </Link>
      </div>
      <CampaignTable />
    </div>
  );
}
