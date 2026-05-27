import { logger } from '../lib/logger';
import { prisma } from '../lib/prisma';
import { DriftDetectionService } from '../services/financial/DriftDetectionService';

export class FinancialIntegrityAuditWorker {
  private intervalId: NodeJS.Timeout | null = null;
  private isScanning = false;

  public start() {
    logger.info('[FinancialIntegrityAuditWorker] Initializing automated 60-minute Financial Integrity Audit loop...');
    
    // Run an initial scan 5 seconds after startup so we don't block the main thread boot
    setTimeout(() => {
      this.runAuditScan().catch((err) => {
        logger.error(err, '[FinancialIntegrityAuditWorker] Error during initial audit scan');
      });
    }, 5000);

    // Run scan every 60 minutes (3,600,000 ms)
    this.intervalId = setInterval(() => {
      this.runAuditScan().catch((err) => {
        logger.error(err, '[FinancialIntegrityAuditWorker] Error during scheduled audit scan');
      });
    }, 3600000);
  }

  public stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      logger.info('[FinancialIntegrityAuditWorker] Audit loop stopped.');
    }
  }

  public async runAuditScan() {
    if (this.isScanning) {
      logger.warn('[FinancialIntegrityAuditWorker] Audit scan is already in progress, skipping...');
      return;
    }

    this.isScanning = true;
    logger.info('[FinancialIntegrityAuditWorker] Running scheduled multi-tenant Financial Integrity Audit scan...');

    try {
      // 1. Query active tenants
      const activeTenants = await prisma.tenant.findMany({
        where: {
          status: 'ACTIVE'
        }
      });

      logger.info(`[FinancialIntegrityAuditWorker] Found ${activeTenants.length} active tenants to scan.`);

      for (const tenant of activeTenants) {
        logger.info(`[FinancialIntegrityAuditWorker] Auditing tenant: ${tenant.name} (${tenant.id})`);

        // A. Run System Balances Audit (Journal entries Credit/Debit parity)
        try {
          const sysAudit = await DriftDetectionService.auditAllSystemBalances(tenant.id);
          if (sysAudit.driftCount > 0) {
            logger.error(
              { tenantId: tenant.id, driftCount: sysAudit.driftCount, discrepancies: sysAudit.discrepancies },
              `[FinancialIntegrityAuditWorker] WARNING: Journal ledger Credits vs Debits mismatch for tenant ${tenant.name}`
            );
          }
        } catch (sysErr) {
          logger.error(sysErr, `[FinancialIntegrityAuditWorker] Failed system balance audit for tenant ${tenant.id}`);
        }

        // B. Run Wallet balance drift audit against LedgerEntry journals
        try {
          const wallets = await prisma.wallet.findMany({
            where: { tenantId: tenant.id }
          });

          for (const wallet of wallets) {
            // checkWalletDrift evaluates balance against LedgerEntries
            // and automatically records an 'UNRESOLVED' Drift record & triggers metrics if a drift is found.
            const check = await DriftDetectionService.checkWalletDrift(tenant.id, wallet.id);
            if (check.hasDrift) {
              logger.error(
                { tenantId: tenant.id, walletId: wallet.id, driftAmount: check.driftAmount.toString() },
                `[FinancialIntegrityAuditWorker] CRITICAL: Balance drift mismatch found on wallet: ${wallet.id}. Drift amount: ${check.driftAmount}`
              );
            }
          }
        } catch (walletErr) {
          logger.error(walletErr, `[FinancialIntegrityAuditWorker] Failed wallet balance drift audit for tenant ${tenant.id}`);
        }
      }

      logger.info('[FinancialIntegrityAuditWorker] Automated multi-tenant Financial Integrity Audit scan completed successfully.');
    } catch (err: any) {
      if (err.name === 'PrismaClientInitializationError' || err.message?.includes('Can\'t reach database')) {
        logger.warn('[FinancialIntegrityAuditWorker] Could not connect to database, skipping this audit scan.');
      } else {
        logger.error(err, '[FinancialIntegrityAuditWorker] Fatal error running automated audit scans');
      }
    } finally {
      this.isScanning = false;
    }
  }
}

export const startFinancialIntegrityAuditWorker = () => {
  const worker = new FinancialIntegrityAuditWorker();
  worker.start();
  return {
    close: async () => {
      worker.stop();
    }
  };
};
