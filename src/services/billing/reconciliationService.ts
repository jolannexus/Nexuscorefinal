import { prisma } from '../../lib/prisma';
import { Prisma } from '@prisma/client';
import { financialLogger as logger } from '../../lib/logger';
import { reconciliationDrift, settlementAnomalyCounter } from '../../lib/metrics';
import { metrics } from '../../utils/metrics';

export interface DriftReport {
  walletId: string;
  userId: string;
  recordedBalance: number;
  computedBalance: number;
  recordedFrozen: number;
  computedFrozen: number;
  driftDetected: boolean;
  activeDrift: number;
  frozenDrift: number;
}

export interface OrphanedReport {
  transactionId: string;
  status: string;
  createdAt: Date;
  ageMinutes: number;
  actionTaken: 'NONE' | 'CANCELLED_AND_REFUNDED' | 'HEALED';
}

export class ReconciliationService {
  /**
   * Run a full tenant-scoped reconciliation job to detect and optionally heal financial drift
   */
  static async runReconciliation(tenantId: string, autoHeal = false) {
    logger.info({ tenantId, autoHeal }, `Starting reconciliation audit for tenant: ${tenantId}`);
    
    const startTimeResult = Date.now();
    const driftReports: DriftReport[] = [];
    const orphanedReports: OrphanedReport[] = [];
    let integrityScore = 100;
    let anomalyCount = 0;

    // 1. Audit Wallet Balance Drift
    const wallets = await prisma.wallet.findMany({
      where: { tenantId },
      include: { user: true }
    });

    for (const wallet of wallets) {
      // Compute wallet balance from double-entry LedgerEntries
      // Formula: computedActiveBalance = Sum(DEBIT entries) - Sum(CREDIT entries)
      const debitAggregation = await prisma.ledgerEntry.aggregate({
        where: {
          accountId: wallet.id,
          type: 'DEBIT',
          tenantId
        },
        _sum: { amount: true }
      });

      const creditAggregation = await prisma.ledgerEntry.aggregate({
        where: {
          accountId: wallet.id,
          type: 'CREDIT',
          tenantId
        },
        _sum: { amount: true }
      });

      const sumDebits = Number(debitAggregation._sum.amount || 0);
      const sumCredits = Number(creditAggregation._sum.amount || 0);
      const computedBalance = sumDebits - sumCredits;

      // Also compute frozen from legacy or journals
      // Freeze journal increases frozen (liability is DEBIT system:frozen, CREDIT user active: wait, system:liability:frozen is debited/credited)
      // Let's compute frozen using WalletLedger (with direct order reference and types) as a secondary validation
      const freezeLedgersSum = await prisma.walletLedger.aggregate({
        where: {
          walletId: wallet.id,
          tenantId,
          type: 'FREEZE'
        },
        _sum: { amount: true }
      });

      const unfreezeLedgersSum = await prisma.walletLedger.aggregate({
        where: {
          walletId: wallet.id,
          tenantId,
          type: 'UNFREEZE'
        },
        _sum: { amount: true }
      });

      const confirmDebitSum = await prisma.walletLedger.aggregate({
        where: {
          walletId: wallet.id,
          tenantId,
          type: 'CONFIRM_DEBIT'
        },
        _sum: { amount: true }
      });

      const totalFrozenCreated = Number(freezeLedgersSum._sum.amount || 0);
      const totalFrozenUnfrozen = Number(unfreezeLedgersSum._sum.amount || 0);
      const totalFrozenConfirmed = Number(confirmDebitSum._sum.amount || 0);
      const computedFrozen = Math.max(0, totalFrozenCreated - totalFrozenUnfrozen - totalFrozenConfirmed);

      const recordedBalance = Number(wallet.balance);
      const recordedFrozen = Number(wallet.frozenBalance);

      const activeDrift = Math.abs(recordedBalance - computedBalance);
      const frozenDrift = Math.abs(recordedFrozen - computedFrozen);

      const driftDetected = activeDrift > 0.01 || frozenDrift > 0.01;

      if (driftDetected) {
        anomalyCount++;
        logger.warn({
          walletId: wallet.id,
          recordedBalance,
          computedBalance,
          recordedFrozen,
          computedFrozen,
          activeDrift,
          frozenDrift
        }, `Ledger Balance Drift detected for Wallet: ${wallet.id}`);
        metrics.increment('reconciliation.drift.detected', { tenant: tenantId, wallet: wallet.id });

        if (autoHeal) {
          await this.healWalletDrift(wallet.id, computedBalance, computedFrozen);
          logger.info(`Healed Wallet Balance Drift for Wallet: ${wallet.id}`);
        }
      }

      driftReports.push({
        walletId: wallet.id,
        userId: wallet.userId,
        recordedBalance,
        computedBalance,
        recordedFrozen,
        computedFrozen,
        driftDetected,
        activeDrift,
        frozenDrift
      });
    }

    // 2. Audit Orphaned/Stuck Transactions (e.g., status 'PROCESSING' which has been stuck for > 30 minutes)
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    const stuckTransactions = await prisma.transaction.findMany({
      where: {
        tenantId,
        status: 'PROCESSING',
        createdAt: { lt: thirtyMinutesAgo }
      }
    });

    for (const trx of stuckTransactions) {
      anomalyCount++;
      const ageMinutes = Math.round((Date.now() - trx.createdAt.getTime()) / 60000);
      let actionTaken: 'NONE' | 'CANCELLED_AND_REFUNDED' | 'HEALED' = 'NONE';

      logger.warn({
        transactionId: trx.id,
        status: trx.status,
        createdAt: trx.createdAt
      }, `Stuck Transaction detected: ${trx.id} (Age: ${ageMinutes}m)`);
      metrics.increment('reconciliation.stuck_transaction.detected', { tenant: tenantId });

      if (autoHeal) {
        // Find resellerId through the wallet or ledger entries
        const wallet = await prisma.wallet.findFirst({
          where: { tenantId }
        });
        if (wallet && wallet.userId) {
          const { TransactionManagerService } = await import('./transactionManagerService');
          const success = await TransactionManagerService.failAndRefundOrder(
            trx.id,
            wallet.userId,
            tenantId,
            `Automated Reconciliation Recovery: Cancelled after ${ageMinutes}m inactivity.`
          );
          if (success) {
            actionTaken = 'CANCELLED_AND_REFUNDED';
            logger.info(`Successfully cancelled & refunded stale transaction: ${trx.id}`);
          }
        }
      }

      orphanedReports.push({
        transactionId: trx.id,
        status: trx.status,
        createdAt: trx.createdAt,
        ageMinutes,
        actionTaken
      });
    }

    // Compute status metrics and persist report
    const processedWallets = driftReports.length;
    integrityScore = Math.max(0, 100 - (anomalyCount / (processedWallets || 1)) * 100);

    metrics.timing('reconciliation.job.latency', Date.now() - startTimeResult, { tenant: tenantId });
    logger.info({
      tenantId,
      integrityScore,
      anomalyCount
    }, `Reconciliation audit completed for tenant: ${tenantId}. Integrity Score: ${integrityScore}%`);

    return {
      timestamp: new Date(),
      tenantId,
      integrityScore,
      anomalyCount,
      driftReports,
      orphanedReports
    };
  }

  /**
   * Heal a specific wallet by resetting balance tocomputed balance, recording reconciliation ledger
   */
  private static async healWalletDrift(walletId: string, correctBalance: number, correctFrozen: number) {
    await prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({
        where: { id: walletId }
      });

      if (!wallet) return;

      const diffActive = correctBalance - Number(wallet.balance);
      const diffFrozen = correctFrozen - Number(wallet.frozenBalance);

      // 1. Correct wallet
      await tx.wallet.update({
        where: { id: walletId },
        data: {
          balance: new Prisma.Decimal(correctBalance),
          frozenBalance: new Prisma.Decimal(correctFrozen)
        }
      });

      // 2. Insert correction Ledger Journals and Reconciliation record to preserve audit trial
      const journalId = `reconciled-correction-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      
      const journal = await tx.ledgerJournal.create({
        data: {
          tenantId: wallet.tenantId,
          type: 'MANUAL_ADJUSTMENT',
          description: `SYSTEM Reconciliation Correction: Active adjustment of ${diffActive}, Frozen adjustment of ${diffFrozen}`,
          idempotencyKey: journalId,
          entries: {
            create: [
              {
                accountId: wallet.id,
                tenantId: wallet.tenantId,
                type: diffActive >= 0 ? 'DEBIT' : 'CREDIT',
                amount: new Prisma.Decimal(Math.abs(diffActive)),
                balanceBefore: wallet.balance,
                balanceAfter: new Prisma.Decimal(correctBalance)
              },
              {
                accountId: 'SYSTEM:ADJUSTMENT:DRIFT',
                tenantId: wallet.tenantId,
                type: diffActive >= 0 ? 'CREDIT' : 'DEBIT',
                amount: new Prisma.Decimal(Math.abs(diffActive))
              }
            ]
          }
        }
      });

      await tx.reconciliationRecord.create({
        data: {
          tenantId: wallet.tenantId,
          journalId: journal.id,
          status: 'RESOLVED',
          expectedAmount: new Prisma.Decimal(correctBalance),
          actualAmount: wallet.balance,
          notes: `Reconciliation auto-healed balance diff: ${diffActive}, frozen diff: ${diffFrozen}`
        }
      });
    });
  }
}
