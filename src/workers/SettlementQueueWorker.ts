import { Worker } from 'bullmq';
import { getRedisClient } from '../lib/redis';
import { QueueName } from '../lib/queueManager';
import { logger } from '../lib/logger';
import { SettlementEngine } from '../services/financial/SettlementEngine';

export const startSettlementQueueWorker = () => {
  return new Worker(
    QueueName.SETTLEMENT,
    async (job) => {
      const { type, tenantId, orderId, walletId, amount, supplierSettlementAmount, idempotencyKey, reason } = job.data;
      logger.info({ jobId: job.id, type, orderId }, `Processing settlement queue task`);

      try {
        if (type === 'INITIATE') {
          await SettlementEngine.initiateSettlement(tenantId, walletId, amount, orderId, idempotencyKey);
        } else if (type === 'COMMIT') {
          await SettlementEngine.commitSettlement(tenantId, orderId, supplierSettlementAmount, idempotencyKey);
        } else if (type === 'ROLLBACK') {
          await SettlementEngine.rollbackSettlement(tenantId, walletId, orderId, idempotencyKey, reason);
        } else {
          throw new Error(`Unknown settlement task type: ${type}`);
        }

        return { status: 'success', type, orderId };
      } catch (err: any) {
        logger.error({ err, orderId, type }, 'Settlement queue task failed');
        throw err;
      }
    },
    { connection: getRedisClient(true), concurrency: 10 }
  );
};
