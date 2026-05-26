import { Queue, Worker, QueueEvents } from 'bullmq';
import { getRedisClient } from './redis';
import { logger } from './logger';

export enum QueueName {
  TRANSACTION_PROCESSING = 'transaction-processing',
  WEBHOOK_DELIVERY = 'webhook-delivery',
  RECONCILIATION = 'reconciliation',
}

// Queue initialization helper
export const createQueue = (name: QueueName) => {
  return new Queue(name, {
    connection: getRedisClient(),
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
    },
  });
};

// Global queue instances
export const transactionQueue = createQueue(QueueName.TRANSACTION_PROCESSING);
export const webhookQueue = createQueue(QueueName.WEBHOOK_DELIVERY);
export const reconciliationQueue = createQueue(QueueName.RECONCILIATION);

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
