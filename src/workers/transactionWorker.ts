import { Worker } from 'bullmq';
import { getRedisClient } from '../lib/redis';
import { QueueName } from '../lib/queueManager';
import { logger } from '../lib/logger';

export const startTransactionWorker = () => {
  const worker = new Worker(
    QueueName.TRANSACTION_PROCESSING,
    async (job) => {
      logger.info(`Processing transaction job: ${job.id}`);
      // Actual processing logic will go here
      const { transactionId } = job.data;
      
      // Example: await processOrder(transactionId);
      
      return { status: 'completed' };
    },
    { 
        connection: getRedisClient() as any,
        concurrency: 5 
    }
  );


  worker.on('active', (job) => {
    logger.info(`Transaction job ${job.id} started processing`);
  });

  worker.on('failed', (job, err) => {
    logger.error(`Transaction job ${job?.id} failed: ${err.message}`);
  });

  worker.on('stalled', (jobId) => {
    logger.warn(`Transaction job ${jobId} stalled`);
  });

  worker.on('error', (err) => {
    logger.error(`Transaction worker error: ${err.message}`);
  });

  return worker;
};
