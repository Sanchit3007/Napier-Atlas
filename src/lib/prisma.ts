import { PrismaClient } from '@prisma/client';

// One shared database client; reused across hot reloads in development so connections don't pile up.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;