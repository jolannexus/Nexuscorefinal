import { Queue } from 'bullmq';
import { getRedisClient } from '../lib/redis';
import { queueLagMetrics } from '../lib/metrics';
import { workerLogger } from '../lib/logger';
import { QueueName } from '../lib/queueManager';

export const startQueueTelemetryWorker = () => {
  const connection = getRedisClient();
  const queues = [
    new Queue(QueueName.TRANSACTION_PROCESSING, { connection: connection as any }),
    new Queue(QueueName.WEBHOOK_DELIVERY, { connection: connection as any }),
    new Queue(QueueName.RECONCILIATION, { connection: connection as any }),
    new Queue('settlement-queue', { connection: connection as any }),
    new Queue(QueueName.SETTLEMENT, { connection: connection as any }),
    new Queue(QueueName.PAYOUT, { connection: connection as any }),
    new Queue(QueueName.AUDIT, { connection: connection as any })
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
