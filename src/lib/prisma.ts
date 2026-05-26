import { PrismaClient } from '@prisma/client';

// Gracefully supply default connection parameters if not set to prevent initial PrismaClient initialization crash in sandbox environment
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/nexuscore?schema=public&sslmode=prefer';
}

const globalForPrisma = global as unknown as { prisma: any };

const basePrisma = new PrismaClient({
  log: [], // Suppress connection connection errors in console logs for sandbox environment
});

// Implement strict engine-level immutability for financial journals & entries
export const prisma = (globalForPrisma.prisma || basePrisma).$extends({
  query: {
    ledgerJournal: {
      update: () => { throw new Error('CRITICAL_FINANCIAL_ERROR: LedgerJournal is strictly immutable and cannot be updated.'); },
      updateMany: () => { throw new Error('CRITICAL_FINANCIAL_ERROR: LedgerJournal is strictly immutable and cannot be updated.'); },
      delete: () => { throw new Error('CRITICAL_FINANCIAL_ERROR: LedgerJournal is strictly immutable and cannot be deleted.'); },
      deleteMany: () => { throw new Error('CRITICAL_FINANCIAL_ERROR: LedgerJournal is strictly immutable and cannot be deleted.'); },
    },
    ledgerEntry: {
      update: () => { throw new Error('CRITICAL_FINANCIAL_ERROR: LedgerEntry is strictly immutable and cannot be updated.'); },
      updateMany: () => { throw new Error('CRITICAL_FINANCIAL_ERROR: LedgerEntry is strictly immutable and cannot be updated.'); },
      delete: () => { throw new Error('CRITICAL_FINANCIAL_ERROR: LedgerEntry is strictly immutable and cannot be deleted.'); },
      deleteMany: () => { throw new Error('CRITICAL_FINANCIAL_ERROR: LedgerEntry is strictly immutable and cannot be deleted.'); },
    },
  },
}) as unknown as PrismaClient;

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

