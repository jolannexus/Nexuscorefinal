import { prisma } from '../../lib/prisma';
import { logger } from '../../lib/logger';
import { LedgerEngine, LedgerAccountType } from '../financial/LedgerEngine';
import { LedgerAuditService } from '../financial/LedgerAuditService';
import { EscrowManager } from '../financial/EscrowManager';
import { Prisma } from '@prisma/client';

export class RefundEngine {
  /**
   * Processes a structured financial refund with double-entry accounting and rollback protection
   */
  static async processRefund(
    tenantId: string,
    transactionId: string,
    amount: number,
    reason: string,
    idempotencyKey: string
  ) {
    if (amount <= 0) {
      throw new Error('Refund amount must be positive.');
    }

    const decimalAmount = new Prisma.Decimal(amount);

    return await prisma.$transaction(async (tx) => {
      // 1. Double Refund Prevention
      const existingRefund = await tx.ledgerJournal.findFirst({
        where: {
          tenantId,
          type: 'REFUND',
          idempotencyKey,
        },
      });

      if (existingRefund) {
        logger.warn({ idempotencyKey, transactionId }, 'Replay-reversal detected. Refund already processed.');
        return { success: true, alreadyProcessed: true, journalId: existingRefund.id };
      }

      // 2. Load the corresponding transaction
      const transaction = await tx.transaction.findFirst({
        where: { id: transactionId, tenantId },
        include: {
          items: true,
        },
      });

      if (!transaction) {
        throw new Error(`Refund failed: Transaction ${transactionId} not found.`);
      }

      if (transaction.status === 'REFUNDED') {
        throw new Error(`Transaction ${transactionId} has already been fully refunded.`);
      }

      // 3. Handle Escrow Balance reversal if active
      const escrowRecord = await tx.escrowBalance.findFirst({
        where: {
          tenantId,
          orderId: transactionId,
          status: 'HELD',
        },
      });

      let journal;
      if (escrowRecord) {
        // Escrow refund flow
        logger.info({ escrowId: escrowRecord.id, transactionId }, 'Escrow hold detected. Refunding through Escrow Refund controller.');
        const updatedEscrow = await EscrowManager.refundEscrow(tenantId, escrowRecord.id, idempotencyKey);
        
        await tx.transaction.update({
          where: { id: transactionId },
          data: { refundStatus: 'FULL', status: 'REFUNDED' },
        });

        return {
          success: true,
          type: 'ESCROW_REFUND',
          escrowId: updatedEscrow.id,
          amount,
        };
      }

      // 4. Standard Transaction Refund (SYSTEM_LIABILITY to USER_WALLET / credit)
      // Retrieve target Wallet LEDGER
      const firstLedger = await tx.walletLedger.findFirst({
        where: { orderId: transactionId },
      });

      const walletId = firstLedger?.walletId;
      if (!walletId) {
        throw new Error(`Cannot trace user wallet from transaction logs for ${transactionId}`);
      }

      journal = await LedgerEngine.recordTransaction({
        tenantId,
        type: 'REFUND',
        description: `Refund committed: ${reason} for transaction ${transactionId}`,
        idempotencyKey,
        entries: [
          { accountId: 'SYSTEM_LIABILITY', accountType: LedgerAccountType.SYSTEM_LIABILITY, amount: decimalAmount, type: 'DEBIT' },
          { accountId: walletId, accountType: LedgerAccountType.USER_WALLET, amount: decimalAmount, type: 'CREDIT' },
        ],
      });

      // Update Transaction model
      await tx.transaction.update({
        where: { id: transactionId },
        data: {
          refundStatus: 'FULL',
          status: 'REFUNDED',
        },
      });

      // Audit standard transaction refund
      await LedgerAuditService.logEvent(
        tx,
        tenantId,
        'REFUND_COMMITTED',
        JSON.stringify({
          transactionId,
          walletId,
          amount: decimalAmount.toString(),
          reason,
          journalId: journal.id,
        }),
        'INFO',
        idempotencyKey
      );

      logger.info({ transactionId, walletId, refundAmount: amount }, 'Transaction successfully refunded. Balancing journal entries recorded.');

      return {
        success: true,
        type: 'STANDARD_REFUND',
        journalId: journal.id,
        amount,
      };
    });
  }
}
