import { Worker } from 'bullmq';
import { getRedisClient } from '../lib/redis';
import { QueueName } from '../lib/queueManager';
import { logger } from '../lib/logger';
import { LedgerAuditService } from '../services/financial/LedgerAuditService';
import { prisma } from '../lib/prisma';

export const startAuditQueueWorker = () => {
  return new Worker(
    QueueName.AUDIT,
    async (job) => {
      const { tenantId, action, details, severity, correlationId } = job.data;
      logger.debug({ jobId: job.id, action }, `Processing asynchronous financial audit logging`);

      try {
        await prisma.$transaction(async (tx) => {
          await LedgerAuditService.logEvent(tx, tenantId, action, details, severity, correlationId);
        });
        return { status: 'audit_logged' };
      } catch (err: any) {
        logger.error({ err, action }, 'Failed to persist audit log asynchronously');
        throw err;
      }
    },
    { connection: getRedisClient() as any, concurrency: 20 }
  );
};
