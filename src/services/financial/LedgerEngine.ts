import { prisma } from '../../lib/prisma';
import { Prisma } from '@prisma/client';
import { financialLogger } from '../../lib/logger';

export enum LedgerAccountType {
  USER_WALLET = 'USER_WALLET',
  FROZEN_BALANCE = 'FROZEN_BALANCE',
  TENANT_BALANCE = 'TENANT_BALANCE',
  SYSTEM_LIABILITY = 'SYSTEM_LIABILITY',
  SYSTEM_REVENUE = 'SYSTEM_REVENUE',
  SUPPLIER_SETTLEMENT = 'SUPPLIER_SETTLEMENT',
  COMMISSION_POOL = 'COMMISSION_POOL',
  REFUND_RESERVE = 'REFUND_RESERVE',
  PLATFORM_ESCROW = 'PLATFORM_ESCROW',
}

export interface LedgerEntryData {
  accountId: string; // The wallet ID or system account identifier
  accountType: LedgerAccountType;
  amount: Prisma.Decimal | number | string;
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
  /**
   * Commits a double-entry journal and securely mutates the underlying wallet balances.
   * This is the ONLY place where wallet balances should be mutated.
   */
  static async recordTransaction(data: JournalRequest) {
    const dEntries = data.entries.map((e) => ({
      ...e,
      amount: new Prisma.Decimal(e.amount),
    }));

    // 1. Double-Entry Integrity Check
    let totalCredit = new Prisma.Decimal(0);
    let totalDebit = new Prisma.Decimal(0);

    for (const e of dEntries) {
      if (e.amount.lessThan(0)) {
        throw new Error(`Ledger entry amounts must be positive`);
      }
      if (e.type === 'CREDIT') totalCredit = totalCredit.add(e.amount);
      if (e.type === 'DEBIT') totalDebit = totalDebit.add(e.amount);
    }

    if (!totalCredit.equals(totalDebit)) {
      throw new Error(`Ledger integrity check failed: Total Credit (${totalCredit}) != Total Debit (${totalDebit})`);
    }

    // Check for existing transaction using idempotencyKey
    const existingJournal = await prisma.ledgerJournal.findUnique({
      where: { idempotencyKey: data.idempotencyKey },
    });
    if (existingJournal) {
      financialLogger.info(
        { idempotencyKey: data.idempotencyKey, journalId: existingJournal.id },
        'Idempotent ledger transaction replay detected. Returning existing journal.'
      );
      return existingJournal;
    }

    return await prisma.$transaction(async (tx) => {
      // 2. Identify Unique Wallets that need Locking
      const walletIdsToLock = Array.from(
        new Set(
          dEntries
            .filter((e) => e.accountType === LedgerAccountType.USER_WALLET || e.accountType === LedgerAccountType.FROZEN_BALANCE)
            .map((e) => e.accountId)
        )
      );

      // 3. Acquire Row-Level Locks using SELECT FOR NO KEY UPDATE
      const walletsMap = new Map<string, any>();
      if (walletIdsToLock.length > 0) {
        // Sort IDs to prevent deadlocks
        walletIdsToLock.sort();
        
        // Execute raw query for locks safely
        const placeholders = walletIdsToLock.map((_, i) => `$${i + 1}`).join(',');
        const wallets = await tx.$queryRawUnsafe<any[]>(
          `SELECT id, balance, "frozenBalance" FROM "Wallet" WHERE id IN (${placeholders}) FOR NO KEY UPDATE`,
          ...walletIdsToLock
        );

        if (wallets.length !== walletIdsToLock.length) {
          throw new Error('One or more wallets requested for ledger entry do not exist.');
        }

        for (const w of wallets) {
          walletsMap.set(w.id, {
            balance: new Prisma.Decimal(w.balance),
            frozenBalance: new Prisma.Decimal(w.frozenBalance),
          });
        }
      }

      // 4. Create the Journal
      const journal = await tx.ledgerJournal.create({
        data: {
          tenantId: data.tenantId,
          type: data.type,
          description: data.description,
          orderId: data.orderId,
          idempotencyKey: data.idempotencyKey,
        },
      });

      // 5. Calculate New Balances & Insert Entries
      for (const entry of dEntries) {
        let balanceBefore = null;
        let balanceAfter = null;

        if (entry.accountType === LedgerAccountType.USER_WALLET) {
          const w = walletsMap.get(entry.accountId);
          balanceBefore = new Prisma.Decimal(w.balance);
          
          // Depending on domain rules, CREDIT to wallet increases balance, DEBIT decreases
          if (entry.type === 'CREDIT') w.balance = w.balance.add(entry.amount);
          if (entry.type === 'DEBIT') w.balance = w.balance.sub(entry.amount);
          
          if (w.balance.lessThan(0)) {
            throw new Error(`Insufficient funds in wallet ${entry.accountId}.`);
          }
          balanceAfter = w.balance;

          // Also write to WalletLedger for backward compatibility if needed, 
          // or we can transition exclusively to LedgerEntry. We'll write to WalletLedger just in case.
          await tx.walletLedger.create({
            data: {
              walletId: entry.accountId,
              tenantId: data.tenantId,
              amount: entry.amount,
              type: entry.type,
              balanceBefore: balanceBefore,
              balanceAfter: balanceAfter,
              description: data.description,
              idempotencyKey: `${data.idempotencyKey}_${entry.accountId}_${entry.type}`,
              orderId: data.orderId,
            }
          });

        } else if (entry.accountType === LedgerAccountType.FROZEN_BALANCE) {
          const w = walletsMap.get(entry.accountId);
          balanceBefore = new Prisma.Decimal(w.frozenBalance);
          
          // CREDIT increases frozen, DEBIT releases it
          if (entry.type === 'CREDIT') w.frozenBalance = w.frozenBalance.add(entry.amount);
          if (entry.type === 'DEBIT') w.frozenBalance = w.frozenBalance.sub(entry.amount);
          
          if (w.frozenBalance.lessThan(0)) {
            throw new Error(`Insufficient frozen funds in wallet ${entry.accountId}.`);
          }
          balanceAfter = w.frozenBalance;
        }

        // Write the LedgerEntry
        await tx.ledgerEntry.create({
          data: {
            journalId: journal.id,
            accountId: entry.accountId,
            tenantId: data.tenantId,
            type: entry.type,
            amount: entry.amount,
            balanceBefore: balanceBefore,
            balanceAfter: balanceAfter,
          },
        });
      }

      // 6. Persist Updated Wallets safely using raw UPDATE to avoid ORM race conditions
      for (const [id, w] of walletsMap.entries()) {
        await tx.$executeRawUnsafe(
          `UPDATE "Wallet" SET balance = $1::numeric, "frozenBalance" = $2::numeric, "updatedAt" = NOW() WHERE id = $3`,
          w.balance.toString(),
          w.frozenBalance.toString(),
          id
        );
      }

      financialLogger.info(
        { journalId: journal.id, idempotencyKey: data.idempotencyKey, totalAmount: totalCredit.toNumber() },
        'Ledger transaction cleanly committed'
      );

      return journal;
    });
  }
}
