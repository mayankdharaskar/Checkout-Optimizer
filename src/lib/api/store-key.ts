import { prisma } from "@/lib/prisma";
import type { Store } from "@/generated/prisma/client";

export async function resolveStoreByPublicKey(
  publicKey: string | null,
): Promise<Store | null> {
  if (!publicKey || publicKey.trim().length === 0) {
    return null;
  }
  return prisma.store.findUnique({
    where: { publicKey: publicKey.trim() },
  });
}

export function getStoreKeyFromRequest(request: Request): string | null {
  const header = request.headers.get("X-Store-Key");
  if (header) return header;

  const url = new URL(request.url);
  return url.searchParams.get("key");
}
