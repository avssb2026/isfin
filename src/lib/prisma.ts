import "./prisma-env";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

function createPrisma(): PrismaClient {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

/** Один клиент на инстанс (важно для Vercel serverless: переиспользование соединений). */
const client = globalForPrisma.prisma ?? createPrisma();
globalForPrisma.prisma = client;
export const prisma = client;
