import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api/response";
import { registerSchema } from "@/lib/validators/auth";
import { generatePublicKey } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError("Invalid registration data", 400);
    }

    const email = parsed.data.email.toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return jsonError("Email already registered", 409);
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    const slug = parsed.data.storeName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 48);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: parsed.data.name,
        stores: {
          create: {
            name: parsed.data.storeName,
            slug: `${slug}-${Date.now().toString(36)}`,
            publicKey: generatePublicKey(),
          },
        },
      },
      include: { stores: true },
    });

    return jsonOk(
      {
        userId: user.id,
        storeId: user.stores[0]?.id,
        email: user.email,
      },
      201,
    );
  } catch {
    return jsonError("Registration failed", 500);
  }
}
