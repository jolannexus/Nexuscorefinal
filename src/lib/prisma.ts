import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

function cleanDatabaseUrl(url: string | undefined): string | undefined {
  if (!url) return url;
  let cleaned = url;
  
  // Strip and URL-encode bracketed passwords automatically
  if (cleaned.includes('[') && cleaned.includes(']')) {
    cleaned = cleaned.replace(/\[(.*?)\]/, (_, p1) => encodeURIComponent(p1));
  }
  
  return cleaned;
}

// DATABASE_URL harus dikonfigurasi melalui file .env
// Ensure connection parameters are sanitized and cleaned before Prisma Client parses them
process.env.DATABASE_URL = cleanDatabaseUrl(process.env.DATABASE_URL);
process.env.DIRECT_URL = cleanDatabaseUrl(process.env.DIRECT_URL);

// Gracefully supply default connection parameters if not set to prevent initial PrismaClient initialization crash in sandbox environment
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/nexuscore?schema=public&sslmode=prefer';
}

if (!process.env.DIRECT_URL) {
  process.env.DIRECT_URL = process.env.DATABASE_URL; // Fallback
}

// Optimize Supabase PostgreSQL integration for PgBouncer
if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("pgbouncer=true")) {
  const separator = process.env.DATABASE_URL.includes("?") ? "&" : "?";
  process.env.DATABASE_URL += `${separator}pgbouncer=true&connection_limit=1`;
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = (globalForPrisma.prisma || new PrismaClient({
  log: [], // Suppress connection connection errors in console logs for sandbox environment
})).$extends({
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

