import { PrismaClient } from "@prisma/client";
import { env } from "env.mjs";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */
export const prisma =
  globalForPrisma.prisma ??
  /* eslint-disable-next-line @typescript-eslint/no-unsafe-call */
  new PrismaClient({
    log:
      env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

/* eslint-disable-line @typescript-eslint/no-unsafe-assignment */
if (env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
