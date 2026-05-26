import { logger } from '../lib/logger';
import { startTransactionWorker } from './transactionWorker';
import { startReconciliationWorker } from './ReconciliationWorker';
import { startQueueTelemetryWorker } from './QueueTelemetryWorker';
import { startLedgerSettlementWorker } from './LedgerSettlementWorker';
import { startSettlementQueueWorker } from './SettlementQueueWorker';
import { startPayoutQueueWorker } from './PayoutQueueWorker';
import { startAuditQueueWorker } from './AuditQueueWorker';

export const startAllWorkers = () => {
  logger.info('Starting background workers...');
  
  const transactionWorker = startTransactionWorker();
  const reconciliationWorker = startReconciliationWorker();
  const ledgerSettlementWorker = startLedgerSettlementWorker();
  const queueTelemetryWorker = startQueueTelemetryWorker();
  const settlementQueueWorker = startSettlementQueueWorker();
  const payoutQueueWorker = startPayoutQueueWorker();
  const auditQueueWorker = startAuditQueueWorker();
  
  const shutdown = async () => {
    logger.info('Shutting down background workers gracefully...');
    await transactionWorker.close();
    await reconciliationWorker.close();
    await ledgerSettlementWorker.close();
    await queueTelemetryWorker.close();
    await settlementQueueWorker.close();
    await payoutQueueWorker.close();
    await auditQueueWorker.close();
  };

  return { shutdown };
};
