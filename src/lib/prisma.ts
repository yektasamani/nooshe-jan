import { PrismaClient } from "@prisma/client";

// Standard Next.js singleton pattern — avoids exhausting Postgres
// connections from hot-reloaded module instances in dev.
// https://www.prisma.io/docs/orm/more/help-and-troubleshooting/nextjs-help

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
