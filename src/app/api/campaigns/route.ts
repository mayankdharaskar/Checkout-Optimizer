import { jsonError, jsonOk } from "@/lib/api/response";
import {
  createCampaign,
  listCampaigns,
} from "@/lib/campaigns/service";
import { getStoreForSession } from "@/lib/session";
import { createCampaignSchema } from "@/lib/validators/campaign";

export async function GET() {
  const store = await getStoreForSession();
  if (!store) return jsonError("Unauthorized", 401);

  const campaigns = await listCampaigns(store.id);
  return jsonOk({ campaigns });
}

export async function POST(request: Request) {
  const store = await getStoreForSession();
  if (!store) return jsonError("Unauthorized", 401);

  try {
    const body: unknown = await request.json();
    const parsed = createCampaignSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError("Invalid campaign data", 400);
    }

    const campaign = await createCampaign(store.id, parsed.data);
    return jsonOk({ campaign }, 201);
  } catch {
    return jsonError("Failed to create campaign", 500);
  }
}
