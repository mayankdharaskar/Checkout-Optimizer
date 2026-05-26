import { jsonError, jsonOk } from "@/lib/api/response";
import { getDashboardAnalytics } from "@/lib/analytics/aggregates";
import { getStoreForSession } from "@/lib/session";

export async function GET() {
  const store = await getStoreForSession();
  if (!store) return jsonError("Unauthorized", 401);

  const analytics = await getDashboardAnalytics(store.id);
  return jsonOk({ analytics });
}
