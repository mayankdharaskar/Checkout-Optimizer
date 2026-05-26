import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Store } from "@/generated/prisma/client";

export async function requireSession() {
  const session = await auth();
  if (!session?.user?.storeId) {
    return null;
  }
  return session;
}

export async function getStoreForSession(): Promise<Store | null> {
  const session = await requireSession();
  if (!session?.user?.storeId) return null;

  return prisma.store.findFirst({
    where: {
      id: session.user.storeId,
      ownerId: session.user.id,
    },
  });
}
