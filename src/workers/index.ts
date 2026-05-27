import { logger } from '../lib/logger';
import { startTransactionWorker } from './transactionWorker';
import { startReconciliationWorker } from './ReconciliationWorker';
import { startQueueTelemetryWorker } from './QueueTelemetryWorker';
import { startLedgerSettlementWorker } from './LedgerSettlementWorker';
import { startSettlementQueueWorker } from './SettlementQueueWorker';
import { startPayoutQueueWorker } from './PayoutQueueWorker';
import { startAuditQueueWorker } from './AuditQueueWorker';
import { startFinancialIntegrityAuditWorker } from './FinancialIntegrityAuditWorker';

const globalForWorkers = globalThis as unknown as {
  workers: any[];
};

export const startAllWorkers = async () => {
  if (globalForWorkers.workers) {
    logger.info('Workers already running, skipping initialization (HMR)');
    return {
      shutdown: async () => {
        logger.info('Shutting down background workers gracefully...');
        for (const instance of globalForWorkers.workers) {
          try {
              await instance.close();
          } catch (err) {
              logger.error({ err }, 'Error during worker shutdown');
          }
        }
        globalForWorkers.workers = [];
      }
    };
  }

  logger.info('Starting background workers...');
  
  const workers = [
    { name: 'TransactionWorker', start: startTransactionWorker },
    { name: 'ReconciliationWorker', start: startReconciliationWorker },
    { name: 'LedgerSettlementWorker', start: startLedgerSettlementWorker },
    { name: 'QueueTelemetryWorker', start: startQueueTelemetryWorker },
    { name: 'SettlementQueueWorker', start: startSettlementQueueWorker },
    { name: 'PayoutQueueWorker', start: startPayoutQueueWorker },
    { name: 'AuditQueueWorker', start: startAuditQueueWorker },
    { name: 'FinancialIntegrityAuditWorker', start: startFinancialIntegrityAuditWorker },
  ];

  const instances: any[] = [];
  
  for (const w of workers) {
    try {
      logger.info(`Initializing worker: ${w.name}`);
      const instance = w.start() as any;
      
      if (instance && typeof instance.on === 'function') {
        instance.on('error', (err: Error) => {
          logger.error({ err, worker: w.name }, `[CRITICAL_WORKER_ERROR] Worker encountered an isolated error. Process thread preserved.`);
        });
      }
      
      instances.push(instance);
    } catch (err) {
      logger.error({ err }, `Failed to start worker: ${w.name}`);
    }
  }

  globalForWorkers.workers = instances;
  
  const shutdown = async () => {
    logger.info('Shutting down background workers gracefully...');
    for (const instance of instances) {
        try {
            await instance.close();
        } catch (err) {
            logger.error({ err }, 'Error during worker shutdown');
        }
    }
    globalForWorkers.workers = [];
  };

  return { shutdown };
};
