import { AnalyticsOverview } from "@/components/dashboard/analytics-overview";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">
          Analytics overview
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Conversion impact from checkout-stage optimization.
        </p>
      </div>
      <AnalyticsOverview />
    </div>
  );
}
