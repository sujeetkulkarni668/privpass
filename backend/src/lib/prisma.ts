import { PrismaClient } from "@prisma/client";

// Single shared Prisma client. In dev, reuse across hot reloads.
declare global {
  var __privpassPrisma: PrismaClient | undefined;
}

export const prisma =
  global.__privpassPrisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV === "development") {
  global.__privpassPrisma = prisma;
}
