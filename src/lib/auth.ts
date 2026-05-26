import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "@/lib/auth.config";
import { loginSchema } from "@/lib/validators/auth";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const [{ prisma }, bcrypt] = await Promise.all([
          import("@/lib/prisma"),
          import("bcryptjs"),
        ]);

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email.toLowerCase() },
          include: {
            stores: { take: 1, orderBy: { createdAt: "asc" } },
          },
        });

        if (!user) return null;

        const valid = await bcrypt.compare(
          parsed.data.password,
          user.passwordHash,
        );
        if (!valid) return null;

        const store = user.stores[0];
        if (!store) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? user.email,
          storeId: store.id,
          storeName: store.name,
        };
      },
    }),
  ],
});
