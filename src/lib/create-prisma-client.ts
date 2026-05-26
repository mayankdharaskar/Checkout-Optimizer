import { PrismaClient } from "@/generated/prisma/client";

export function createPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL ?? "file:./dev.db";

  if (url.startsWith("libsql:")) {
    const { PrismaLibSql } =
      require("@prisma/adapter-libsql") as typeof import("@prisma/adapter-libsql");

    return new PrismaClient({
      adapter: new PrismaLibSql({
        url,
        authToken: process.env.DATABASE_AUTH_TOKEN,
      }),
    });
  }

  const { PrismaBetterSqlite3 } =
    require("@prisma/adapter-better-sqlite3") as typeof import("@prisma/adapter-better-sqlite3");

  return new PrismaClient({
    adapter: new PrismaBetterSqlite3({ url }),
  });
}
