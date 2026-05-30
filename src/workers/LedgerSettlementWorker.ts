import { Worker } from 'bullmq';
import { getRedisClient } from '../lib/redis';
import { workerLogger, financialLogger } from '../lib/logger';
import { prisma } from '../lib/prisma';
import { SettlementManager } from '../services/financial/SettlementManager';
import { Prisma } from '@prisma/client';

export const startLedgerSettlementWorker = () => {
  return new Worker(
    'settlement-queue',
    async (job) => {
      const { transactionId, tenantId, walletId, amount, supplierSettlementAmount } = job.data;
      workerLogger.info({ transactionId }, `Processing async settlement strategy for transaction: ${transactionId}`);
      
      try {
        const tx = await prisma.transaction.findUnique({ where: { id: transactionId } });
        if (!tx || tx.status !== 'PROCESSING') {
          workerLogger.warn({ transactionId }, 'Transaction not in correct state for settlement');
          return { status: 'skipped' };
        }

        // Apply ledger logic
        const settlement = await SettlementManager.commitSettlement(
           tenantId,
           walletId,
           new Prisma.Decimal(amount),
           new Prisma.Decimal(supplierSettlementAmount),
           transactionId,
           job.id as string
        );

        // Transition the order status
        await prisma.transaction.update({
          where: { id: transactionId },
          data: { status: 'SUCCESS' },
        });

        financialLogger.info({ transactionId, settlementId: settlement.id }, 'Ledger settlement safely committed');
        return { status: 'settled', settlementId: settlement.id };
      } catch (err: any) {
        financialLogger.error({ transactionId, err }, 'Failed to commit ledger settlement. Safe rollback engaged.');
        throw err;
      }
    },
    { 
      connection: getRedisClient() as any,
      concurrency: 50,
      limiter: {
        max: 500,
        duration: 1000,
      } 
    }
  );
};
