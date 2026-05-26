import { NextResponse } from "next/server";
import { evaluateCampaigns } from "@/lib/engine/evaluate";
import { corsHeaders, jsonError } from "@/lib/api/response";
import {
  getStoreKeyFromRequest,
  resolveStoreByPublicKey,
} from "@/lib/api/store-key";
import { evaluateRequestSchema } from "@/lib/validators/evaluate";

export async function OPTIONS(request: Request) {
  const origin = request.headers.get("Origin");
  return new Response(null, {
    status: 204,
    headers: corsHeaders(origin),
  });
}

export async function POST(request: Request) {
  const origin = request.headers.get("Origin");

  try {
    const store = await resolveStoreByPublicKey(
      getStoreKeyFromRequest(request),
    );
    if (!store) {
      return jsonError("Invalid store key", 401);
    }

    const body: unknown = await request.json();
    const parsed = evaluateRequestSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError("Invalid evaluate payload", 400);
    }

    const result = await evaluateCampaigns(store, parsed.data);

    return NextResponse.json(result, {
      status: 200,
      headers: corsHeaders(origin),
    });
  } catch {
    return jsonError("Evaluation failed", 500);
  }
}
