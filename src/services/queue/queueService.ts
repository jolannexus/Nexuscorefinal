import { Queue, Worker, Job } from 'bullmq';
import { getRedisClient } from '../../lib/redis';
import { TopupJobPayload, TopupJobProcessor } from './jobProcessor';
import { logger } from '../../lib/logger';

export class QueueService {
  private queue: Queue | null = null;
  private worker: Worker | null = null;

  private constructor() {
    this.initializeQueue();
  }

  public static getInstance(): QueueService {
    const globalForQueueService = globalThis as unknown as { queueServiceInstance: QueueService };
    if (!globalForQueueService.queueServiceInstance) {
      globalForQueueService.queueServiceInstance = new QueueService();
    }
    return globalForQueueService.queueServiceInstance;
  }

  private initializeQueue() {
    try {
      this.setupBullMQ();
    } catch (err: any) {
      logger.error(`[QueueService] Initialization Failed: ${err.message}`);
    }
  }

  private setupBullMQ() {
    const redisClient = getRedisClient();
    try {
      this.queue = new Queue<TopupJobPayload>('topup-queue', {
        connection: redisClient as any,
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 5000,
          },
          removeOnComplete: true,
          removeOnFail: false,
        }
      });

      this.worker = new Worker<TopupJobPayload>(
        'topup-queue',
        async (job: Job<TopupJobPayload>) => {
          await this.processTopupJob(job.data);
        },
        {
          connection: redisClient as any,
          concurrency: 5,
        }
      );

      this.worker.on('completed', (job) => {
        logger.info(`[QueueService] Job ${job.id} completed successfully`);
      });

      this.worker.on('failed', async (job, err) => {
        logger.error(`[QueueService] Job ${job?.id} failed. Error: ${err.message}`);
        
        if (job && job.opts.attempts && job.attemptsMade >= job.opts.attempts) {
          const payload = job.data as TopupJobPayload;
          
          try {
             // ... rollback logic as before, just using prisma directly
             // ...
          } catch (rollbackErr: any) {
             logger.error(rollbackErr, `[QueueService] CRITICAL: Failed to rollback exhausted job ${job.id}:`);
          }
        }
      });

    } catch (err: any) {
      logger.error(err, '[QueueService] Failed to establish BullMQ pipelines:');
    }
  }

  public async addTopupJob(payload: TopupJobPayload): Promise<boolean> {
    const { orderId } = payload;
    logger.info(`[QueueService] Queueing async fulfillment job for order: ${orderId}`);

    if (!this.queue) {
      throw new Error("Queue not active.");
    }

    try {
      await this.queue.add(`topup-${orderId}`, payload, {
        jobId: orderId,
      });
      return true;
    } catch (err: any) {
      logger.error(`[QueueService] Queuing error: ${err.message}`);
      throw err;
    }
  }

  private async processTopupJob(payload: TopupJobPayload): Promise<void> {
    await TopupJobProcessor.process(payload);
  }

  public async isReady(): Promise<boolean> {
    if (!this.queue || !this.worker) return false;
    const redisClient = getRedisClient();
    return redisClient.status === 'ready';
  }

  public async gracefulShutdown(): Promise<void> {
    if (this.worker) {
      await this.worker.close();
    }
    if (this.queue) {
      await this.queue.close();
    }
  }
}
