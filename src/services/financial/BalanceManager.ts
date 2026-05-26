import { prisma } from '../../lib/prisma';
import { Prisma } from '@prisma/client';
import { LedgerEngine, LedgerAccountType } from './LedgerEngine';
import { LedgerAuditService } from './LedgerAuditService';
import { financialLogger } from '../../lib/logger';

export class BalanceManager {
  /**
   * Adds funds to a user's wallet via double-entry deposit ledger record.
   */
  static async depositFunds(
    tenantId: string,
    walletId: string,
    amount: Prisma.Decimal | number | string,
    idempotencyKey: string,
    description = 'Standard Deposit'
  ) {
    const decimalAmount = new Prisma.Decimal(amount);

    return await prisma.$transaction(async (tx) => {
      // Debit: SYSTEM_LIABILITY (representing inbound cash flow liability)
      // Credit: USER_WALLET
      const journal = await LedgerEngine.recordTransaction({
        tenantId,
        type: 'DEPOSIT',
        description,
        idempotencyKey,
        entries: [
          { accountId: 'SYSTEM_LIABILITY', accountType: LedgerAccountType.SYSTEM_LIABILITY, amount: decimalAmount, type: 'DEBIT' },
          { accountId: walletId, accountType: LedgerAccountType.USER_WALLET, amount: decimalAmount, type: 'CREDIT' },
        ],
      });

      await LedgerAuditService.logEvent(
        tx,
        tenantId,
        'DEPOSIT_COMMITTED',
        JSON.stringify({ walletId, amount: decimalAmount.toString(), journalId: journal.id }),
        'INFO',
        idempotencyKey
      );

      return journal;
    });
  }

  /**
   * Withdraws funds from a user's wallet.
   */
  static async withdrawFunds(
    tenantId: string,
    walletId: string,
    amount: Prisma.Decimal | number | string,
    idempotencyKey: string,
    description = 'Standard Withdrawal'
  ) {
    const decimalAmount = new Prisma.Decimal(amount);

    return await prisma.$transaction(async (tx) => {
      // Debit: USER_WALLET
      // Credit: SYSTEM_LIABILITY
      const journal = await LedgerEngine.recordTransaction({
        tenantId,
        type: 'WITHDRAWAL',
        description,
        idempotencyKey,
        entries: [
          { accountId: walletId, accountType: LedgerAccountType.USER_WALLET, amount: decimalAmount, type: 'DEBIT' },
          { accountId: 'SYSTEM_LIABILITY', accountType: LedgerAccountType.SYSTEM_LIABILITY, amount: decimalAmount, type: 'CREDIT' },
        ],
      });

      await LedgerAuditService.logEvent(
        tx,
        tenantId,
        'WITHDRAWAL_COMMITTED',
        JSON.stringify({ walletId, amount: decimalAmount.toString(), journalId: journal.id }),
        'INFO',
        idempotencyKey
      );

      return journal;
    });
  }

  /**
   * Freezes specified wallet available balance into frozen balance.
   */
  static async freezeFunds(
    tenantId: string,
    walletId: string,
    amount: Prisma.Decimal | number | string,
    orderId: string,
    idempotencyKey: string
  ) {
    const decimalAmount = new Prisma.Decimal(amount);

    return await prisma.$transaction(async (tx) => {
      // Debit: USER_WALLET
      // Credit: FROZEN_BALANCE
      const journal = await LedgerEngine.recordTransaction({
        tenantId,
        type: 'ORDER_FREEZE',
        description: `Freezing funds of ${decimalAmount} for Order ${orderId}`,
        orderId,
        idempotencyKey,
        entries: [
          { accountId: walletId, accountType: LedgerAccountType.USER_WALLET, amount: decimalAmount, type: 'DEBIT' },
          { accountId: walletId, accountType: LedgerAccountType.FROZEN_BALANCE, amount: decimalAmount, type: 'CREDIT' },
        ],
      });

      await LedgerAuditService.logEvent(
        tx,
        tenantId,
        'FUNDS_FROZEN',
        JSON.stringify({ walletId, amount: decimalAmount.toString(), orderId, journalId: journal.id }),
        'INFO',
        idempotencyKey
      );

      return journal;
    });
  }

  /**
   * Reverses freeze (unfreezes) wallet frozen balance back to available balance.
   */
  static async unfreezeFunds(
    tenantId: string,
    walletId: string,
    amount: Prisma.Decimal | number | string,
    orderId: string,
    idempotencyKey: string
  ) {
    const decimalAmount = new Prisma.Decimal(amount);

    return await prisma.$transaction(async (tx) => {
      // Debit: FROZEN_BALANCE
      // Credit: USER_WALLET
      const journal = await LedgerEngine.recordTransaction({
        tenantId,
        type: 'ORDER_FREEZE_REVERSAL',
        description: `Unfreezing funds of ${decimalAmount} for Order ${orderId}`,
        orderId,
        idempotencyKey,
        entries: [
          { accountId: walletId, accountType: LedgerAccountType.FROZEN_BALANCE, amount: decimalAmount, type: 'DEBIT' },
          { accountId: walletId, accountType: LedgerAccountType.USER_WALLET, amount: decimalAmount, type: 'CREDIT' },
        ],
      });

      await LedgerAuditService.logEvent(
        tx,
        tenantId,
        'FUNDS_UNFROZEN',
        JSON.stringify({ walletId, amount: decimalAmount.toString(), orderId, journalId: journal.id }),
        'INFO',
        idempotencyKey
      );

      return journal;
    });
  }
}
