import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  providers: [],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request }) {
      const isDashboard = request.nextUrl.pathname.startsWith("/dashboard");
      const isAuthPage =
        request.nextUrl.pathname === "/login" ||
        request.nextUrl.pathname === "/register";

      if (isDashboard) return !!auth;
      if (isAuthPage) return !auth;
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.storeId = user.storeId;
        token.storeName = user.storeName;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.storeId = token.storeId as string;
        session.user.storeName = token.storeName as string;
      }
      return session;
    },
  },
};
