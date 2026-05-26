import { jsonError, jsonOk } from "@/lib/api/response";
import { prisma } from "@/lib/prisma";
import { getStoreForSession } from "@/lib/session";
import { generatePublicKey } from "@/lib/utils";

export async function GET() {
  const store = await getStoreForSession();
  if (!store) return jsonError("Unauthorized", 401);

  return jsonOk({
    store: {
      id: store.id,
      name: store.name,
      slug: store.slug,
      publicKey: store.publicKey,
      domain: store.domain,
    },
  });
}

export async function POST(request: Request) {
  const store = await getStoreForSession();
  if (!store) return jsonError("Unauthorized", 401);

  try {
    const body = (await request.json()) as { action?: string };
    if (body.action !== "rotate-key") {
      return jsonError("Unknown action", 400);
    }

    const updated = await prisma.store.update({
      where: { id: store.id },
      data: { publicKey: generatePublicKey() },
    });

    return jsonOk({
      store: {
        id: updated.id,
        publicKey: updated.publicKey,
      },
    });
  } catch {
    return jsonError("Failed to update store", 500);
  }
}
