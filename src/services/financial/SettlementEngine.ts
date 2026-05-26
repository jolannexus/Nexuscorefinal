import { prisma } from '../../lib/prisma';
import { Prisma } from '@prisma/client';
import { LedgerEngine, LedgerAccountType } from './LedgerEngine';
import { LedgerAuditService } from './LedgerAuditService';
import { financialLogger } from '../../lib/logger';

export class SettlementEngine {
  /**
   * Acquire a pessimistic database lock on a specific key.
   */
  static async acquireLock(tx: Prisma.TransactionClient, lockKey: string, ttlSeconds = 60): Promise<boolean> {
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
    try {
      // First, clean up expired locks of same key to avoid zombie locks
      await tx.transactionLock.deleteMany({
        where: {
          lockKey,
          expiresAt: { lt: new Date() },
        },
      });

      await tx.transactionLock.create({
        data: {
          lockKey,
          expiresAt,
        },
      });
      return true;
    } catch (err) {
      // Uniqueness violation implies lock is held
      return false;
    }
  }

  /**
   * Release a pessimistic lock.
   */
  static async releaseLock(tx: Prisma.TransactionClient, lockKey: string) {
    try {
      await tx.transactionLock.deleteMany({
        where: { lockKey },
      });
    } catch (err) {
      financialLogger.error({ lockKey, err }, 'Failed to release lock cleanly');
    }
  }

  /**
   * Initiates a settlement workflow by placing funds in Escrow.
   */
  static async initiateSettlement(
    tenantId: string,
    walletId: string,
    amount: Prisma.Decimal | number | string,
    orderId: string,
    idempotencyKey: string
  ) {
    const decimalAmount = new Prisma.Decimal(amount);
    const lockKey = `settle_lock_${orderId}`;

    return await prisma.$transaction(async (tx) => {
      // Acquire Lock
      const hasLock = await this.acquireLock(tx, lockKey);
      if (!hasLock) {
        throw new Error(`Failed to initiate settlement: Lock already held for order ${orderId}`);
      }

      // 1. Create a SettlementRecord with status PENDING
      const settlement = await tx.settlementRecord.create({
        data: {
          tenantId,
          transactionId: orderId,
          amount: decimalAmount,
          supplierAmount: 0.0, // Calculated during commitment
          profitAmount: 0.0,
          status: 'PENDING',
        },
      });

      // 2. Debit USER_WALLET, Credit platform escrow (Hold escrow funds)
      await LedgerEngine.recordTransaction({
        tenantId,
        type: 'ORDER_FREEZE',
        description: `Freezing balance for settlement workflow on order ${orderId}`,
        orderId,
        idempotencyKey,
        entries: [
          { accountId: walletId, accountType: LedgerAccountType.USER_WALLET, amount: decimalAmount, type: 'DEBIT' },
          { accountId: 'PLATFORM_ESCROW', accountType: LedgerAccountType.PLATFORM_ESCROW, amount: decimalAmount, type: 'CREDIT' },
        ],
      });

      // Maintain lock after initiation (the lock expires automatically, or caller releases it)
      await this.releaseLock(tx, lockKey);

      await LedgerAuditService.logEvent(
        tx,
        tenantId,
        'SETTLEMENT_INITIATE',
        JSON.stringify({ orderId, walletId, amount: decimalAmount.toString(), settlementId: settlement.id }),
        'INFO',
        idempotencyKey
      );

      return settlement;
    });
  }

  /**
   * Commits the settlement workflow. Releases escrow, pays supplier, records profit, updates settlement record.
   */
  static async commitSettlement(
    tenantId: string,
    orderId: string,
    supplierSettlementAmount: Prisma.Decimal | number | string,
    idempotencyKey: string
  ) {
    const supplierAmt = new Prisma.Decimal(supplierSettlementAmount);
    const lockKey = `settle_lock_${orderId}`;

    return await prisma.$transaction(async (tx) => {
      // Acquire Lock
      const hasLock = await this.acquireLock(tx, lockKey);
      if (!hasLock) {
        throw new Error(`Failed to commit settlement: Lock already held for order ${orderId}`);
      }

      // Check settlement record
      const settlement = await tx.settlementRecord.findUnique({
        where: { transactionId: orderId },
      });

      if (!settlement) {
        throw new Error(`Settlement Record not found for order ${orderId}`);
      }

      if (settlement.status !== 'PENDING') {
        throw new Error(`Settlement can only be committed from PENDING state. Current status: ${settlement.status}`);
      }

      const totalAmount = new Prisma.Decimal(settlement.amount);
      const profitAmount = totalAmount.sub(supplierAmt);

      if (profitAmount.lessThan(0)) {
        throw new Error(`Supplier settlement amount ${supplierAmt} is greater than total order amount ${totalAmount}`);
      }

      // Release money from Escrow to Supplier and Revenue
      await LedgerEngine.recordTransaction({
        tenantId,
        type: 'ORDER_SETTLEMENT',
        description: `Settling order ${orderId}`,
        orderId,
        idempotencyKey: `commit_${idempotencyKey}`,
        entries: [
          { accountId: 'PLATFORM_ESCROW', accountType: LedgerAccountType.PLATFORM_ESCROW, amount: totalAmount, type: 'DEBIT' },
          { accountId: 'SYSTEM_SUPPLIER', accountType: LedgerAccountType.SUPPLIER_SETTLEMENT, amount: supplierAmt, type: 'CREDIT' },
          { accountId: 'SYSTEM_REVENUE', accountType: LedgerAccountType.SYSTEM_REVENUE, amount: profitAmount, type: 'CREDIT' },
        ],
      });

      // Update settlement record
      const updatedSettlement = await tx.settlementRecord.update({
        where: { id: settlement.id },
        data: {
          supplierAmount: supplierAmt,
          profitAmount,
          status: 'COMPLETED',
          settledAt: new Date(),
        },
      });

      await this.releaseLock(tx, lockKey);

      await LedgerAuditService.logEvent(
        tx,
        tenantId,
        'SETTLEMENT_COMMIT',
        JSON.stringify({ orderId, totalAmount: totalAmount.toString(), supplierAmount: supplierAmt.toString(), profitAmount: profitAmount.toString() }),
        'INFO',
        idempotencyKey
      );

      return updatedSettlement;
    });
  }

  /**
   * Rolls back the initiated settlement order, refunding escrow funds back to user's wallet.
   */
  static async rollbackSettlement(
    tenantId: string,
    walletId: string,
    orderId: string,
    idempotencyKey: string,
    reason = 'Settlement Rollback'
  ) {
    const lockKey = `settle_lock_${orderId}`;

    return await prisma.$transaction(async (tx) => {
      // Acquire Lock
      const hasLock = await this.acquireLock(tx, lockKey);
      if (!hasLock) {
        throw new Error(`Failed to rollback settlement: Lock already held for order ${orderId}`);
      }

      const settlement = await tx.settlementRecord.findUnique({
        where: { transactionId: orderId },
      });

      if (!settlement) {
        throw new Error(`Settlement Record not found for order ${orderId}`);
      }

      if (settlement.status !== 'PENDING') {
        throw new Error(`Settlement can only be rolled back from PENDING state. Current status: ${settlement.status}`);
      }

      const totalAmount = new Prisma.Decimal(settlement.amount);

      // Debit Escrow, Credit User WALLET
      await LedgerEngine.recordTransaction({
        tenantId,
        type: 'ORDER_FREEZE_REVERSAL',
        description: `Rolling back settlement; unfreezing user funds for order ${orderId}. Reason: ${reason}`,
        orderId,
        idempotencyKey: `rollback_${idempotencyKey}`,
        entries: [
          { accountId: 'PLATFORM_ESCROW', accountType: LedgerAccountType.PLATFORM_ESCROW, amount: totalAmount, type: 'DEBIT' },
          { accountId: walletId, accountType: LedgerAccountType.USER_WALLET, amount: totalAmount, type: 'CREDIT' },
        ],
      });

      // Update SettlementRecord status
      const updatedSettlement = await tx.settlementRecord.update({
        where: { id: settlement.id },
        data: {
          status: 'FAILED',
        },
      });

      await this.releaseLock(tx, lockKey);

      await LedgerAuditService.logEvent(
        tx,
        tenantId,
        'SETTLEMENT_ROLLBACK',
        JSON.stringify({ orderId, walletId, amount: totalAmount.toString(), reason }),
        'WARNING',
        idempotencyKey
      );

      return updatedSettlement;
    });
  }
}
