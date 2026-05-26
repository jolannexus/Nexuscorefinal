import { prisma } from '../../lib/prisma';
import { Prisma } from '@prisma/client';
import { logger } from '../../lib/logger';

export enum LedgerAccountType {
  USER_WALLET = 'USER_WALLET',
  TENANT_BALANCE = 'TENANT_BALANCE',
  SYSTEM_LIABILITY = 'SYSTEM_LIABILITY',
  SYSTEM_REVENUE = 'SYSTEM_REVENUE',
  SUPPLIER_SETTLEMENT = 'SUPPLIER_SETTLEMENT',
  FROZEN_BALANCE = 'FROZEN_BALANCE',
  COMMISSION_POOL = 'COMMISSION_POOL',
}

export interface LedgerEntryData {
  accountId: string;
  accountType: LedgerAccountType;
  amount: Prisma.Decimal;
  type: 'CREDIT' | 'DEBIT';
}

export interface JournalRequest {
  tenantId: string;
  type: string;
  description: string;
  orderId?: string;
  idempotencyKey: string;
  entries: LedgerEntryData[];
}

export class LedgerEngine {
  static async createJournal(data: JournalRequest) {
    // 1. Double-Entry Integrity Check
    const totalCredit = data.entries
      .filter(e => e.type === 'CREDIT')
      .reduce((sum, e) => sum.add(e.amount), new Prisma.Decimal(0));
    const totalDebit = data.entries
      .filter(e => e.type === 'DEBIT')
      .reduce((sum, e) => sum.add(e.amount), new Prisma.Decimal(0));

    if (!totalCredit.equals(totalDebit)) {
      throw new Error(`Ledger integrity check failed: Total Credit (${totalCredit}) != Total Debit (${totalDebit})`);
    }

    return await prisma.$transaction(async (tx) => {
      // 2. Create Journal
      const journal = await tx.ledgerJournal.create({
        data: {
          tenantId: data.tenantId,
          type: data.type,
          description: data.description,
          orderId: data.orderId,
          idempotencyKey: data.idempotencyKey,
        },
      });

      // 3. Create Entries
      await tx.ledgerEntry.createMany({
        data: data.entries.map(entry => ({
          journalId: journal.id,
          accountId: entry.accountId,
          tenantId: data.tenantId,
          type: entry.type,
          amount: entry.amount,
        })),
      });

      logger.info({ journalId: journal.id, idempotencyKey: data.idempotencyKey }, 'Ledger journal created successfully');
      return journal;
    });
  }
}
