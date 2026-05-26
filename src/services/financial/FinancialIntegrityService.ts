import { prisma } from '../../lib/prisma';
import { DriftDetectionService } from './DriftDetectionService';
import { LedgerAuditService } from './LedgerAuditService';
import { financialLogger } from '../../lib/logger';

export interface FinancialIntegrityReport {
  tenantId: string;
  timestamp: Date;
  auditTrailValid: boolean;
  tamperedLogCount: number;
  walletDriftCount: number;
  journalDriftCount: number;
  totalDriftAmountUSD: number;
  reconciliationDiscrepancies: number;
  healthStatus: 'HEALTHY' | 'DISRUPTED' | 'CRITICAL';
}

export class FinancialIntegrityService {
  /**
   * Computes a full integrity check across the tenant's ledger and financial data.
   */
  static async performIntegrityAudit(tenantId: string): Promise<FinancialIntegrityReport> {
    financialLogger.info({ tenantId }, 'Performing end-to-end Financial Integrity Audit...');

    // 1. Audit trail cryptographic verification
    const auditIntegrity = await LedgerAuditService.verifyAuditTrailIntegrity(tenantId);
    
    // 2. Ledger Journals Debits/Credits mismatch check
    const systemDrift = await DriftDetectionService.auditAllSystemBalances(tenantId);

    // 3. Check every wallet for balance versus transaction entries drift
    const wallets = await prisma.wallet.findMany({ where: { tenantId } });
    let walletDriftCount = 0;
    
    for (const wallet of wallets) {
      const checkResult = await DriftDetectionService.checkWalletDrift(tenantId, wallet.id);
      if (checkResult.hasDrift) {
        walletDriftCount++;
      }
    }

    // 4. Fetch pending discrepancies in Reconciliation
    const pendingDiscrepancies = await prisma.reconciliationRecord.count({
      where: {
        tenantId,
        status: 'DISCREPANCY',
      },
    });

    // 5. Determine health status
    let healthStatus: 'HEALTHY' | 'DISRUPTED' | 'CRITICAL' = 'HEALTHY';
    if (!auditIntegrity.isValid || walletDriftCount > 0 || systemDrift.driftCount > 0) {
      healthStatus = 'CRITICAL';
    } else if (pendingDiscrepancies > 0) {
      healthStatus = 'DISRUPTED';
    }

    const report: FinancialIntegrityReport = {
      tenantId,
      timestamp: new Date(),
      auditTrailValid: auditIntegrity.isValid,
      tamperedLogCount: auditIntegrity.corruptLogIds.length,
      walletDriftCount,
      journalDriftCount: systemDrift.driftCount,
      totalDriftAmountUSD: systemDrift.discrepancies.reduce((acc: number, item: any) => {
        return acc + Math.abs(parseFloat(item.sumOfDebits) - parseFloat(item.sumOfCredits));
      }, 0),
      reconciliationDiscrepancies: pendingDiscrepancies,
      healthStatus,
    };

    financialLogger.info({ tenantId, report }, 'Financial Integrity Audit completed.');
    return report;
  }
}
