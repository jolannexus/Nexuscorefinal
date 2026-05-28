import { Queue, Worker, QueueEvents } from 'bullmq';
import { getRedisClient } from './redis';
import { logger } from './logger';

export enum QueueName {
  TRANSACTION_PROCESSING = 'transaction-processing',
  WEBHOOK_DELIVERY = 'webhook-delivery',
  RECONCILIATION = 'reconciliation',
  SETTLEMENT = 'settlement',
  PAYOUT = 'payout',
  AUDIT = 'audit',
}

// Queue initialization helper
export const createQueue = (name: QueueName) => {
  return new Queue(name, {
    connection: getRedisClient(),
    defaultJobOptions: {
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
      removeOnComplete: true,
      removeOnFail: false, // Keep failures for dead-letter analysis
    },
  });
};

// Global queue instances
export const transactionQueue = createQueue(QueueName.TRANSACTION_PROCESSING);
export const webhookQueue = createQueue(QueueName.WEBHOOK_DELIVERY);
export const reconciliationQueue = createQueue(QueueName.RECONCILIATION);
export const settlementQueue = createQueue(QueueName.SETTLEMENT);
export const payoutQueue = createQueue(QueueName.PAYOUT);
export const auditQueue = createQueue(QueueName.AUDIT);

// Initialize QueueEvents for monitoring
export const setupQueueMonitoring = (name: QueueName) => {
  const events = new QueueEvents(name, { connection: getRedisClient() });
  
  events.on('failed', ({ jobId, failedReason }) => {
    logger.error(`Job ${jobId} failed in ${name}: ${failedReason}`);
  });
  
  events.on('completed', ({ jobId }) => {
    logger.info(`Job ${jobId} completed in ${name}`);
  });
};

export const shutdownQueues = async () => {
    await Promise.allSettled([
        transactionQueue.close(),
        webhookQueue.close(),
        reconciliationQueue.close(),
        settlementQueue.close(),
        payoutQueue.close(),
        auditQueue.close()
    ]);
};
