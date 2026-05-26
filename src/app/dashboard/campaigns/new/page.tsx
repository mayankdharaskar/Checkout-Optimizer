import { CampaignWizard } from "@/components/dashboard/campaign-wizard";

export default function NewCampaignPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">
          Campaign builder
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Define conditions, triggers, and margin-safe offers.
        </p>
      </div>
      <CampaignWizard />
    </div>
  );
}
