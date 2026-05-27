import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

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
    async $allOperations({ operation, model, args, query }) {
      const start = Date.now();
      const result = await query(args);
      const end = Date.now();
      const duration = end - start;
      
      if (duration > 100) { // Log queries taking longer than 100ms
        logger.warn(`Slow Prisma query detected: ${model}.${operation} took ${duration}ms`);
      }
      return result;
    },
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

