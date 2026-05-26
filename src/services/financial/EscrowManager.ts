import { prisma } from '../../lib/prisma';
import { Prisma } from '@prisma/client';
import { LedgerEngine, LedgerAccountType } from './LedgerEngine';
import { financialLogger } from '../../lib/logger';
import { LedgerAuditService } from './LedgerAuditService';

export class EscrowManager {
  /**
   * Holds an amount in escrow.
   * Debits the user's wallet, credits the platform escrow account, and records the escrow record.
   */
  static async holdEscrow(
    tenantId: string,
    walletId: string,
    amount: Prisma.Decimal | number | string,
    orderId: string,
    idempotencyKey: string,
    description = ''
  ) {
    const decimalAmount = new Prisma.Decimal(amount);

    return await prisma.$transaction(async (tx) => {
      // 1. Double entry journal transaction
      // Debit: USER_WALLET, Credit: PLATFORM_ESCROW
      const journal = await LedgerEngine.recordTransaction({
        tenantId,
        type: 'ESCROW_HOLD',
        description: description || `Escrow hold of ${decimalAmount} for order ${orderId}`,
        orderId,
        idempotencyKey,
        entries: [
          {
            accountId: walletId,
            accountType: LedgerAccountType.USER_WALLET,
            amount: decimalAmount,
            type: 'DEBIT',
          },
          {
            accountId: 'PLATFORM_ESCROW',
            accountType: LedgerAccountType.PLATFORM_ESCROW,
            amount: decimalAmount,
            type: 'CREDIT',
          },
        ],
      });

      // 2. Create the EscrowBalance record
      const escrowRecord = await tx.escrowBalance.create({
        data: {
          tenantId,
          walletId,
          amount: decimalAmount,
          status: 'HELD',
          description,
          orderId,
        },
      });

      // 3. Log to FinancialAuditLog
      await LedgerAuditService.logEvent(
        tx,
        tenantId,
        'ESCROW_HOLD',
        JSON.stringify({
          walletId,
          amount: decimalAmount.toString(),
          orderId,
          escrowId: escrowRecord.id,
          journalId: journal.id,
        }),
        'INFO',
        idempotencyKey
      );

      financialLogger.info(
        { tenantId, orderId, escrowId: escrowRecord.id, amount: decimalAmount.toString() },
        'Escrow hold securely recorded and double-entry logged'
      );

      return escrowRecord;
    });
  }

  /**
   * Releases escrow funds.
   * Debits the platform escrow account, credits systems/suppliers, and updates the escrow record status.
   */
  static async releaseEscrow(
    tenantId: string,
    escrowId: string,
    supplierSettlementAmount: Prisma.Decimal | number | string,
    idempotencyKey: string
  ) {
    return await prisma.$transaction(async (tx) => {
      const escrow = await tx.escrowBalance.findUnique({
        where: { id: escrowId },
      });

      if (!escrow) {
        throw new Error(`Escrow record with ID ${escrowId} not found`);
      }

      if (escrow.status !== 'HELD') {
        throw new Error(`Cannot release escrow with status ${escrow.status}`);
      }

      const totalEscrowAmount = new Prisma.Decimal(escrow.amount);
      const supplierAmt = new Prisma.Decimal(supplierSettlementAmount);
      const profitAmt = totalEscrowAmount.sub(supplierAmt);

      if (profitAmt.lessThan(0)) {
        throw new Error(`Supplier settlement amount ${supplierAmt} cannot exceed total escrow amount ${totalEscrowAmount}`);
      }

      // Debit: PLATFORM_ESCROW (total amount)
      // Credit: SUPPLIER_SETTLEMENT (supplier amount)
      // Credit: SYSTEM_REVENUE (profit amount)
      const journal = await LedgerEngine.recordTransaction({
        tenantId,
        type: 'ESCROW_RELEASE',
        description: `Escrow release for order ${escrow.orderId}`,
        orderId: escrow.orderId || undefined,
        idempotencyKey,
        entries: [
          {
            accountId: 'PLATFORM_ESCROW',
            accountType: LedgerAccountType.PLATFORM_ESCROW,
            amount: totalEscrowAmount,
            type: 'DEBIT',
          },
          {
            accountId: 'SYSTEM_SUPPLIER',
            accountType: LedgerAccountType.SUPPLIER_SETTLEMENT,
            amount: supplierAmt,
            type: 'CREDIT',
          },
          {
            accountId: 'SYSTEM_REVENUE',
            accountType: LedgerAccountType.SYSTEM_REVENUE,
            amount: profitAmt,
            type: 'CREDIT',
          },
        ],
      });

      // Update Escrow status
      const updatedEscrow = await tx.escrowBalance.update({
        where: { id: escrowId },
        data: {
          status: 'RELEASED',
        },
      });

      // Audit Log
      await LedgerAuditService.logEvent(
        tx,
        tenantId,
        'ESCROW_RELEASE',
        JSON.stringify({
          escrowId,
          orderId: escrow.orderId,
          totalAmount: totalEscrowAmount.toString(),
          supplierAmount: supplierAmt.toString(),
          profitAmount: profitAmt.toString(),
          journalId: journal.id,
        }),
        'INFO',
        idempotencyKey
      );

      financialLogger.info(
        { tenantId, escrowId, orderId: escrow.orderId, releasedAmount: totalEscrowAmount.toString() },
        'Escrow funds successfully released to supplier and system revenues'
      );

      return updatedEscrow;
    });
  }

  /**
   * Refunds escrow funds back to the user's wallet.
   * Debits the platform escrow account, credits the user's wallet.
   */
  static async refundEscrow(
    tenantId: string,
    escrowId: string,
    idempotencyKey: string
  ) {
    return await prisma.$transaction(async (tx) => {
      const escrow = await tx.escrowBalance.findUnique({
        where: { id: escrowId },
      });

      if (!escrow) {
        throw new Error(`Escrow record with ID ${escrowId} not found`);
      }

      if (escrow.status !== 'HELD') {
        throw new Error(`Cannot refund escrow with status ${escrow.status}`);
      }

      if (!escrow.walletId) {
        throw new Error(`Cannot refund escrow without associated walletId`);
      }

      const totalEscrowAmount = new Prisma.Decimal(escrow.amount);

      // Debit: PLATFORM_ESCROW
      // Credit: USER_WALLET
      const journal = await LedgerEngine.recordTransaction({
        tenantId,
        type: 'ESCROW_REFUND',
        description: `Escrow refund for order ${escrow.orderId}`,
        orderId: escrow.orderId || undefined,
        idempotencyKey,
        entries: [
          {
            accountId: 'PLATFORM_ESCROW',
            accountType: LedgerAccountType.PLATFORM_ESCROW,
            amount: totalEscrowAmount,
            type: 'DEBIT',
          },
          {
            accountId: escrow.walletId,
            accountType: LedgerAccountType.USER_WALLET,
            amount: totalEscrowAmount,
            type: 'CREDIT',
          },
        ],
      });

      // Update Escrow status
      const updatedEscrow = await tx.escrowBalance.update({
        where: { id: escrowId },
        data: {
          status: 'REFUNDED',
        },
      });

      // Audit Log
      await LedgerAuditService.logEvent(
        tx,
        tenantId,
        'ESCROW_REFUND',
        JSON.stringify({
          escrowId,
          orderId: escrow.orderId,
          walletId: escrow.walletId,
          refundAmount: totalEscrowAmount.toString(),
          journalId: journal.id,
        }),
        'INFO',
        idempotencyKey
      );

      financialLogger.info(
        { tenantId, escrowId, orderId: escrow.orderId, walletId: escrow.walletId },
        'Escrow funds successfully refunded back to wallet'
      );

      return updatedEscrow;
    });
  }
}
