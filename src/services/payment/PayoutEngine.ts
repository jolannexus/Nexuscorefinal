import crypto from 'crypto';
import { prisma } from '../../lib/prisma';
import { logger } from '../../lib/logger';
import { PaymentGatewayManager } from './PaymentGatewayManager';
import { PayoutRequest } from './PaymentProviderAdapter';
import { LedgerEngine, LedgerAccountType } from '../financial/LedgerEngine';
import { LedgerAuditService } from '../financial/LedgerAuditService';
import { Prisma } from '@prisma/client';

import { FraudDetectionService } from '../financial/FraudDetectionService';

export class PayoutEngine {
  /**
   * Initiates a secure real-money payout across providers with atomic double-entry ledger bookkeeping
   */
  static async initiatePayout(
    tenantId: string,
    walletId: string,
    amount: number,
    bankCode: string,
    accountNumber: string,
    accountName: string,
    description: string,
    correlationId: string
  ) {
    // 1. Payout Anomaly Detection Threshold
    const ANOMALY_THRESHOLD = 50000000; // Limit single payout to 50,000,000 IDR
    if (amount > ANOMALY_THRESHOLD) {
      logger.error(
        { tenantId, amount, walletId },
        'CRITICAL_FINANCIAL_ALERT: Payout threshold exceeded anomaly. Access Denied.'
      );
      throw new Error('FINANCIAL_ALERT: Payout transaction blocks due to threshold ceiling breach.');
    }

    if (amount <= 0) {
      throw new Error('Payout amount must be positive.');
    }

    // 1.5 Realtime Velocity & Fraud Check
    const isSafe = await FraudDetectionService.evaluatePayoutRisk(tenantId, walletId, amount);
    if (!isSafe) {
       throw new Error('SECURITY_ALERT: Transaction blocked by anti-fraud velocity policies.');
    }

    // 2. Query balance directly
    const wallet = await prisma.wallet.findFirst({
      where: { id: walletId },
    });

    if (!wallet || wallet.balance.toNumber() < amount) {
      throw new Error(`Insufficient funds inside wallet ${walletId}. Available: ${wallet?.balance || 0}`);
    }

    const decimalAmount = new Prisma.Decimal(amount);

    // 3. Commit Double-entry Transaction
    return await prisma.$transaction(async (tx) => {
      const journal = await LedgerEngine.recordTransaction({
        tenantId,
        type: 'WITHDRAWAL',
        description: `Payout pending for ${accountName} via ${bankCode}`,
        idempotencyKey: correlationId,
        entries: [
          { accountId: walletId, accountType: LedgerAccountType.USER_WALLET, amount: decimalAmount, type: 'DEBIT' },
          { accountId: 'SYSTEM_LIABILITY', accountType: LedgerAccountType.SYSTEM_LIABILITY, amount: decimalAmount, type: 'CREDIT' },
        ],
      });

      // 4. Trigger Real Disbursal API using healthiest gateway
      const manager = PaymentGatewayManager.getInstance();
      const adapter = await manager.getBestAdapter(tenantId, 'xendit');
      const payoutId = `payout-${crypto.randomBytes(12).toString('hex')}`;

      try {
        const payload: PayoutRequest = {
          payoutId,
          amount,
          bankCode,
          accountNumber,
          accountName,
          description,
        };

        const result = await manager.executeWithBreaker(adapter.getName(), () => adapter.processPayout(tenantId, payload));

        // Maintain log records
        await LedgerAuditService.logEvent(
          tx,
          tenantId,
          'PAYOUT_INITIATED',
          JSON.stringify({
            payoutId,
            walletId,
            amount,
            status: result.status,
            referenceId: result.referenceId,
            journalId: journal.id,
          }),
          'INFO',
          correlationId
        );

        return {
          success: true,
          payoutId,
          status: result.status,
          referenceId: result.referenceId,
          journalId: journal.id,
        };
      } catch (gatewayErr: any) {
        await manager.recordFailure(tenantId, adapter.getName());

        // Reverse double-entry ledger to restore user's fund safely
        const rollbackKey = `rollback-pay-${correlationId}`;
        await LedgerEngine.recordTransaction({
          tenantId,
          type: 'REFUND',
          description: `ROLLBACK: Failed Payout to ${accountName} (${bankCode})`,
          idempotencyKey: rollbackKey,
          entries: [
            { accountId: 'SYSTEM_LIABILITY', accountType: LedgerAccountType.SYSTEM_LIABILITY, amount: decimalAmount, type: 'DEBIT' },
            { accountId: walletId, accountType: LedgerAccountType.USER_WALLET, amount: decimalAmount, type: 'CREDIT' },
          ],
        });

        logger.error({ err: gatewayErr, tenantId, walletId }, 'Payout gateway failure. Automated balance rollback succeeded.');
        throw new Error(`Payout failed: ${gatewayErr.message}`);
      }
    });
  }
}
