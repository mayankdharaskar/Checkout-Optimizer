import { jsonError, jsonOk, noContent } from "@/lib/api/response";
import {
  deleteCampaign,
  getCampaign,
  updateCampaign,
} from "@/lib/campaigns/service";
import { getStoreForSession } from "@/lib/session";
import { updateCampaignSchema } from "@/lib/validators/campaign";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const store = await getStoreForSession();
  if (!store) return jsonError("Unauthorized", 401);

  const { id } = await context.params;
  const campaign = await getCampaign(store.id, id);
  if (!campaign) return jsonError("Campaign not found", 404);

  return jsonOk({ campaign });
}

export async function PATCH(request: Request, context: RouteContext) {
  const store = await getStoreForSession();
  if (!store) return jsonError("Unauthorized", 401);

  const { id } = await context.params;

  try {
    const body: unknown = await request.json();
    const parsed = updateCampaignSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError("Invalid campaign data", 400);
    }

    const campaign = await updateCampaign(store.id, id, parsed.data);
    if (!campaign) return jsonError("Campaign not found", 404);

    return jsonOk({ campaign });
  } catch {
    return jsonError("Failed to update campaign", 500);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const store = await getStoreForSession();
  if (!store) return jsonError("Unauthorized", 401);

  const { id } = await context.params;
  const deleted = await deleteCampaign(store.id, id);
  if (!deleted) return jsonError("Campaign not found", 404);

  return noContent();
}
