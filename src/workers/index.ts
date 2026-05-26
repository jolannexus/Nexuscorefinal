import { logger } from '../lib/logger';
import { startTransactionWorker } from './transactionWorker';
import { startReconciliationWorker } from './ReconciliationWorker';

export const startAllWorkers = () => {
  logger.info('Starting background workers...');
  
  const transactionWorker = startTransactionWorker();
  const reconciliationWorker = startReconciliationWorker();
  
  // Register graceful shutdown
  const shutdown = async () => {
    logger.info('Shutting down background workers...');
    await transactionWorker.close();
    await reconciliationWorker.close();
    process.exit(0);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
};
