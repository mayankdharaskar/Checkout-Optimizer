import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { corsHeaders, jsonError } from "@/lib/api/response";
import {
  getStoreKeyFromRequest,
  resolveStoreByPublicKey,
} from "@/lib/api/store-key";
import { trackEventSchema } from "@/lib/validators/analytics";

export async function OPTIONS(request: Request) {
  const origin = request.headers.get("Origin");
  return new Response(null, {
    status: 204,
    headers: corsHeaders(origin),
  });
}

export async function POST(request: Request) {
  const origin = request.headers.get("Origin");
  const headers = corsHeaders(origin);

  try {
    const store = await resolveStoreByPublicKey(
      getStoreKeyFromRequest(request),
    );
    if (!store) {
      return jsonError("Invalid store key", 401);
    }

    const body: unknown = await request.json();
    const parsed = trackEventSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError("Invalid event payload", 400);
    }

    const data = parsed.data;

    if (data.campaignId) {
      const campaign = await prisma.campaign.findFirst({
        where: { id: data.campaignId, storeId: store.id },
      });
      if (!campaign) {
        return jsonError("Invalid campaign", 400);
      }
    }

    await prisma.analyticsEvent.create({
      data: {
        storeId: store.id,
        campaignId: data.campaignId,
        offerId: data.offerId,
        sessionId: data.sessionId,
        eventType: data.eventType,
        cartCents: data.cartCents,
        country: data.country,
        metadataJson: data.metadata
          ? JSON.stringify(data.metadata)
          : null,
      },
    });

    return new NextResponse(null, { status: 204, headers });
  } catch {
    return NextResponse.json(
      { error: "Failed to track event" },
      { status: 500, headers },
    );
  }
}
