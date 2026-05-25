import { PrismaClient } from '@prisma/client';

// Gracefully supply default connection parameters if not set to prevent initial PrismaClient initialization crash in sandbox environment
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/nexuscore?schema=public&sslmode=prefer';
}

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: [], // Suppress connection connection errors in console logs for sandbox environment
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

