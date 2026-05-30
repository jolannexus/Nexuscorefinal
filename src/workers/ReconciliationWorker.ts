import { Worker } from 'bullmq';
import { getRedisClient } from '../lib/redis';
import { QueueName } from '../lib/queueManager';
import { logger } from '../lib/logger';
import { DriftDetectionService } from '../services/financial/DriftDetectionService';

export const startReconciliationWorker = () => {
  return new Worker(
    QueueName.RECONCILIATION,
    async (job) => {
      const { tenantId, walletId, type } = job.data;
      logger.info({ jobId: job.id, tenantId, walletId }, `Reconciling transaction balances`);
      
      try {
        if (type === 'WALLET_AUDIT') {
          const check = await DriftDetectionService.checkWalletDrift(tenantId, walletId);
          return { status: 'reconciled', hasDrift: check.hasDrift, driftAmount: check.driftAmount.toString() };
        } else if (type === 'SYSTEM_AUDIT') {
          const check = await DriftDetectionService.auditAllSystemBalances(tenantId);
          return { status: 'reconciled', driftCount: check.driftCount };
        }
        
        return { status: 'skipped' };
      } catch (err: any) {
        logger.error({ err, tenantId, walletId }, 'Reconciliation background runner failed');
        throw err;
      }
    },
    { connection: getRedisClient() }
  );
};
