import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    storeId: string;
    storeName: string;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      storeId: string;
      storeName: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    storeId?: string;
    storeName?: string;
  }
}
