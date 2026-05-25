import { Queue, Worker, Job } from 'bullmq';
import Redis from 'ioredis';
import { TopupJobPayload, TopupJobProcessor } from './jobProcessor';

export class QueueService {
  private static instance: QueueService;
  private queue: Queue | null = null;
  private worker: Worker | null = null;
  private redisClient: Redis | null = null;

  private constructor() {
    this.initializeQueue();
  }

  public static getInstance(): QueueService {
    if (!QueueService.instance) {
      QueueService.instance = new QueueService();
    }
    return QueueService.instance;
  }

  /**
   * Initializes queue, strictly requiring Redis persistence for durability.
   */
  private initializeQueue() {
    const redisHost = process.env.REDIS_HOST;
    const redisPort = process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379;
    const redisPassword = process.env.REDIS_PASSWORD;
    const redisUrl = process.env.REDIS_URL;

    // Determine connection feasibility
    const hasRedisConfig = redisUrl || redisHost;

    if (!hasRedisConfig) {
      console.warn('[QueueService] Missing Redis environment configurations. Proceeding without queue functionality.');
      return;
    }

    try {
      const redisOptions: any = {
        maxRetriesPerRequest: null, // Critical requirement for BullMQ
        connectTimeout: 5000,
      };

      if (redisUrl) {
        this.redisClient = new Redis(redisUrl, redisOptions);
      } else {
        this.redisClient = new Redis({
          host: redisHost,
          port: redisPort,
          password: redisPassword,
          ...redisOptions,
        });
      }

      this.redisClient.on('error', (err) => {
        console.warn('[QueueService] Redis connection error:', err.message);
      });

      this.redisClient.on('connect', () => {
        console.log('[QueueService] Linked into central Redis orchestration node');
        this.setupBullMQ();
      });
    } catch (err: any) {
      console.error(`[QueueService] Initialization Failed: ${err.message}`);
    }
  }

  /**
   * Bootstraps clean BullMQ orchestrators using the active Redis connection
   */
  private setupBullMQ() {
    if (!this.redisClient) return;

    try {
      this.queue = new Queue<TopupJobPayload>('topup-queue', {
        connection: this.redisClient,
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 5000, // Wait 5s, then 10s, then 20s
          },
          removeOnComplete: true,
          removeOnFail: false, // Keep failures for DLQ review
        }
      });

      this.worker = new Worker<TopupJobPayload>(
        'topup-queue',
        async (job: Job<TopupJobPayload>) => {
          await this.processTopupJob(job.data);
        },
        {
          connection: this.redisClient,
          concurrency: 5, // Limit concurrent processing threads
        }
      );

      this.worker.on('completed', (job) => {
        console.log(`[QueueService] Job ${job.id} completed successfully`);
      });

      this.worker.on('failed', async (job, err) => {
        console.error(`[QueueService] Job ${job?.id} failed on attempt ${job?.attemptsMade}/${job?.opts.attempts}. Error: ${err.message}`);
        
        // If max attempts exhausted, execute final ACID ledger refund
        if (job && job.opts.attempts && job.attemptsMade >= job.opts.attempts) {
          console.error(`[QueueService] Job ${job.id} EXHAUSTED max retries. Executing Ledger rollback and marking as FAILED.`);
          const payload = job.data as TopupJobPayload;
          
          try {
             // In a perfect system, we would query the ledger to find the resellerId. 
             // To be 100% safe, we can trigger the refund. But we need resellerId.
             // We can pass resellerId inside TopupJobPayload!
             // For now we will look it up dynamically inline for safety.
             const orderRecord = await import('../../lib/prisma').then(m => m.prisma.transaction.findUnique({
               where: { id: payload.orderId },
               include: { journals: { include: { entries: true } } }
             }));

             if (orderRecord && orderRecord.status === 'PROCESSING') {
                const freezeJournal = orderRecord.journals.find(j => j.type === 'FREEZE');
                if (freezeJournal && freezeJournal.entries.length > 0) {
                    // Try to locate user ID from entry accountId (if wallet)
                    const credEntry = freezeJournal.entries.find(e => e.type === 'CREDIT' && !e.accountId.startsWith('SYSTEM:'));
                    const walletId = credEntry ? credEntry.accountId : null;
                    
                    if (walletId) {
                      const wallet = await import('../../lib/prisma').then(m => m.prisma.wallet.findUnique({ where: { id: walletId } }));
                      if (wallet && wallet.userId) {
                        const { TransactionManagerService } = await import('../billing/transactionManagerService');
                        await TransactionManagerService.failAndRefundOrder(payload.orderId, wallet.userId, payload.agencyId, `Exhausted Retries: ${err.message}`);
                        console.log(`[QueueService] Automatically rolled back and refunded exhausted order: ${payload.orderId}`);
                      }
                    }
                }
             }
          } catch (rollbackErr: any) {
             console.error(`[QueueService] CRITICAL: Failed to rollback exhausted job ${job.id}:`, rollbackErr);
          }
        }
      });

    } catch (err: any) {
      console.error('[QueueService] Failed to establish BullMQ pipelines:', err);
    }
  }

  /**
   * Exposed interface to add topup requests to the background fulfillment engine
   */
  public async addTopupJob(payload: TopupJobPayload): Promise<boolean> {
    const { orderId, agencyId } = payload;
    console.log(`[QueueService] Queueing async fulfillment job for order: ${orderId}`);

    if (!this.queue || !this.redisClient) {
      throw new Error("Redis and Queue must be active to queue a topup job safely.");
    }

    try {
      await this.queue.add(`topup-${orderId}`, payload, {
        jobId: orderId, // Deduplication guarantee
      });
      return true;
    } catch (err: any) {
      console.error(`[QueueService] Queuing error: ${err.message}`);
      throw err;
    }
  }

  /**
   * Central job processing engine.
   * Delegates execution to TopupJobProcessor.
   */
  private async processTopupJob(payload: TopupJobPayload): Promise<void> {
    await TopupJobProcessor.process(payload);
  }

  /**
   * Gracefully close Redis structures and Workers
   */
  public async gracefulShutdown(): Promise<void> {
    if (this.worker) {
      await this.worker.close();
    }
    if (this.queue) {
      await this.queue.close();
    }
    if (this.redisClient) {
      await this.redisClient.quit();
    }
    console.log('[QueueService] Background connections released cleanly');
  }
}
