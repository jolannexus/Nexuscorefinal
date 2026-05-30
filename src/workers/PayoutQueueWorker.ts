import { Worker } from 'bullmq';
import { getRedisClient } from '../lib/redis';
import { QueueName } from '../lib/queueManager';
import { logger } from '../lib/logger';
import { BalanceManager } from '../services/financial/BalanceManager';

export const startPayoutQueueWorker = () => {
  return new Worker(
    QueueName.PAYOUT,
    async (job) => {
      const { tenantId, walletId, amount, idempotencyKey, description } = job.data;
      logger.info({ jobId: job.id, walletId, amount }, `Processing payout orchestration task`);

      try {
        const journal = await BalanceManager.withdrawFunds(tenantId, walletId, amount, idempotencyKey, description);
        return { status: 'payout_completed', journalId: journal.id };
      } catch (err: any) {
        logger.error({ err, walletId }, 'Payout queue execution failed');
        throw err;
      }
    },
    { connection: getRedisClient() as any, concurrency: 5 }
  );
};
