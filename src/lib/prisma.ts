// src/lib/prisma.ts

import { PrismaClient } from '@prisma/client'
import { logger } from './logger'

// Fallback database URL for local/sandbox safety
if (!process.env.DATABASE_URL) {
process.env.DATABASE_URL =
'postgresql://postgres:postgres@localhost:5432/nexuscore?schema=public&sslmode=prefer'
}

if (!process.env.DIRECT_URL) {
process.env.DIRECT_URL = process.env.DATABASE_URL
}

// Apply PgBouncer optimization once
if (
process.env.DATABASE_URL &&
!process.env.DATABASE_URL.includes('pgbouncer=true')
) {
const separator = process.env.DATABASE_URL.includes('?') ? '&' : '?'

process.env.DATABASE_URL +=
"${separator}pgbouncer=true&connection_limit=1"
}

const globalForPrisma = globalThis as unknown as {
prisma?: PrismaClient
}

export const prisma =
globalForPrisma.prisma ??
new PrismaClient({
log:
process.env.NODE_ENV === 'production'
? ['error']
: ['error', 'warn'],
}).$extends({
query: {
async $allOperations({ operation, model, args, query }) {
const start = Date.now()

    const result = await query(args)

    const duration = Date.now() - start

    if (duration > 100) {
      logger.warn(
        `Slow Prisma query detected: ${model}.${operation} took ${duration}ms`
      )
    }

    return result
  },

  ledgerJournal: {
    update: () => {
      throw new Error(
        'CRITICAL_FINANCIAL_ERROR: LedgerJournal is immutable.'
      )
    },

    updateMany: () => {
      throw new Error(
        'CRITICAL_FINANCIAL_ERROR: LedgerJournal is immutable.'
      )
    },

    delete: () => {
      throw new Error(
        'CRITICAL_FINANCIAL_ERROR: LedgerJournal is immutable.'
      )
    },

    deleteMany: () => {
      throw new Error(
        'CRITICAL_FINANCIAL_ERROR: LedgerJournal is immutable.'
      )
    },
  },

  ledgerEntry: {
    update: () => {
      throw new Error(
        'CRITICAL_FINANCIAL_ERROR: LedgerEntry is immutable.'
      )
    },

    updateMany: () => {
      throw new Error(
        'CRITICAL_FINANCIAL_ERROR: LedgerEntry is immutable.'
      )
    },

    delete: () => {
      throw new Error(
        'CRITICAL_FINANCIAL_ERROR: LedgerEntry is immutable.'
      )
    },

    deleteMany: () => {
      throw new Error(
        'CRITICAL_FINANCIAL_ERROR: LedgerEntry is immutable.'
      )
    },
  },
},

}) as unknown as PrismaClient

// Always cache singleton
globalForPrisma.prisma = prisma

// Graceful shutdown
process.on('SIGINT', async () => {
await prisma.$disconnect()
})

process.on('SIGTERM', async () => {
await prisma.$disconnect()
})