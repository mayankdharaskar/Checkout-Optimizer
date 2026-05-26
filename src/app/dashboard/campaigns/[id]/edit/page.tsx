import { notFound } from "next/navigation";
import { CampaignWizard } from "@/components/dashboard/campaign-wizard";
import { getCampaign } from "@/lib/campaigns/service";
import { getStoreForSession } from "@/lib/session";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditCampaignPage({ params }: PageProps) {
  const { id } = await params;
  const store = await getStoreForSession();
  if (!store) notFound();

  const campaign = await getCampaign(store.id, id);
  if (!campaign) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Edit campaign</h1>
        <p className="mt-1 text-sm text-zinc-500">{campaign.name}</p>
      </div>
      <CampaignWizard campaign={campaign} />
    </div>
  );
}
