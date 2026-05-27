import { Queue } from 'bullmq';
import { getRedisClient } from '../lib/redis';
import { queueLagMetrics } from '../lib/metrics';
import { workerLogger } from '../lib/logger';
import { QueueName } from '../lib/queueManager';

export const startQueueTelemetryWorker = () => {
  const connection = getRedisClient();
  const queues = [
    new Queue(QueueName.TRANSACTION_PROCESSING, { connection }),
    new Queue(QueueName.WEBHOOK_DELIVERY, { connection }),
    new Queue(QueueName.RECONCILIATION, { connection }),
    new Queue('settlement-queue', { connection }),
    new Queue(QueueName.SETTLEMENT, { connection }),
    new Queue(QueueName.PAYOUT, { connection }),
    new Queue(QueueName.AUDIT, { connection })
  ];

  const interval = setInterval(async () => {
    for (const queue of queues) {
      try {
        const waiting = await queue.getWaitingCount();
        const active = await queue.getActiveCount();
        const failed = await queue.getFailedCount();

        queueLagMetrics.labels(queue.name).set(waiting);

        if (waiting > 100) {
          workerLogger.warn({ queue: queue.name, waiting, active }, 'High queue lag detected');
        }

        if (failed > 0) {
          workerLogger.info({ queue: queue.name, failed }, 'Jobs in dead letter state');
        }
      } catch (err: any) {
        workerLogger.error(err, `Failed to collect queue telemetry for ${queue.name}`);
      }
    }
  }, 10000); // 10 seconds

  return {
    close: async () => {
      clearInterval(interval);
      for (const queue of queues) {
        await queue.close().catch(() => {});
      }
      await connection.quit().catch(() => {});
    }
  };
};
