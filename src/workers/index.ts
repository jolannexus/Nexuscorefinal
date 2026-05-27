import { logger } from '../lib/logger';
import { startTransactionWorker } from './transactionWorker';
import { startReconciliationWorker } from './ReconciliationWorker';
import { startQueueTelemetryWorker } from './QueueTelemetryWorker';
import { startLedgerSettlementWorker } from './LedgerSettlementWorker';
import { startSettlementQueueWorker } from './SettlementQueueWorker';
import { startPayoutQueueWorker } from './PayoutQueueWorker';
import { startAuditQueueWorker } from './AuditQueueWorker';
import { startFinancialIntegrityAuditWorker } from './FinancialIntegrityAuditWorker';

export const startAllWorkers = async () => {
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
      instances.push(w.start());
    } catch (err) {
      logger.error({ err }, `Failed to start worker: ${w.name}`);
    }
  }
  
  const shutdown = async () => {
    logger.info('Shutting down background workers gracefully...');
    for (const instance of instances) {
        try {
            await instance.close();
        } catch (err) {
            logger.error({ err }, 'Error during worker shutdown');
        }
    }
  };

  return { shutdown };
};
