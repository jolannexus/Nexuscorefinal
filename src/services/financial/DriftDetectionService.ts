import { prisma } from '../../lib/prisma';
import { Prisma } from '@prisma/client';
import { LedgerAuditService } from './LedgerAuditService';
import { financialLogger } from '../../lib/logger';
import { ledgerDoubleEntryErrors } from '../../lib/metrics';

export class DriftDetectionService {
  /**
   * Evaluates if a wallet balance drifts from its double-entry ledger history.
   * Compiles sum of all LEDGER entries for a wallet and compares it against actual wallet.balance.
   */
  static async checkWalletDrift(tenantId: string, walletId: string): Promise<{
    hasDrift: boolean;
    expectedBalance: Prisma.Decimal;
    actualBalance: Prisma.Decimal;
    driftAmount: Prisma.Decimal;
  }> {
    return await prisma.$transaction(async (tx) => {
      // 1. Fetch current wallet
      const wallet = await tx.wallet.findUnique({
        where: { id: walletId },
      });

      if (!wallet) throw new Error(`Wallet ${walletId} not found`);

      // 2. Fetch all ledger entries under this walletId
      const entries = await tx.ledgerEntry.findMany({
        where: {
          tenantId,
          accountId: walletId,
        },
      });

      // Calculate balance from entry history: Credits increase it, Debits decrease it
      let expectedBalance = new Prisma.Decimal(0);
      for (const entry of entries) {
        if (entry.type === 'CREDIT') {
          expectedBalance = expectedBalance.add(entry.amount);
        } else if (entry.type === 'DEBIT') {
          expectedBalance = expectedBalance.sub(entry.amount);
        }
      }

      const actualBalance = new Prisma.Decimal(wallet.balance);
      const driftAmount = actualBalance.sub(expectedBalance);
      const hasDrift = !driftAmount.isZero();

      if (hasDrift) {
        financialLogger.warn(
          { tenantId, walletId, expectedBalance: expectedBalance.toString(), actualBalance: actualBalance.toString(), driftAmount: driftAmount.toString() },
          'Wallet balance drift mismatch detected!'
        );

        // Record drift in database
        const driftRecord = await tx.reconciliationDrift.create({
          data: {
            tenantId,
            accountId: walletId,
            driftAmount,
            status: 'UNRESOLVED',
            notes: `Auto-detected drift: Expected ${expectedBalance}, got ${actualBalance}. Diff: ${driftAmount}`,
          },
        });

        // Trigger Prometheus metric increment
        ledgerDoubleEntryErrors.inc({ tenant_id: tenantId, severity: 'HIGH' });

        // Financial log audit event
        await LedgerAuditService.logEvent(
          tx,
          tenantId,
          'BALANCE_DRIFT_DETECTED',
          JSON.stringify({
            walletId,
            expectedBalance: expectedBalance.toString(),
            actualBalance: actualBalance.toString(),
            driftAmount: driftAmount.toString(),
            driftRecordId: driftRecord.id,
          }),
          'CRITICAL'
        );
      }

      return {
        hasDrift,
        expectedBalance,
        actualBalance,
        driftAmount,
      };
    });
  }

  /**
   * Checks system-wide drift (escrows, revenue, suppliers).
   */
  static async auditAllSystemBalances(tenantId: string): Promise<{
    authenticatedCount: number;
    driftCount: number;
    discrepancies: any[];
  }> {
    // Collect all journals to verify balance matching
    const journals = await prisma.ledgerJournal.findMany({
      where: { tenantId },
      include: { entries: true },
    });

    let totalDriftCount = 0;
    const discrepancies: any[] = [];

    for (const journal of journals) {
      let sumOfDebits = new Prisma.Decimal(0);
      let sumOfCredits = new Prisma.Decimal(0);

      for (const e of journal.entries) {
        if (e.type === 'DEBIT') sumOfDebits = sumOfDebits.add(e.amount);
        if (e.type === 'CREDIT') sumOfCredits = sumOfCredits.add(e.amount);
      }

      if (!sumOfDebits.equals(sumOfCredits)) {
        totalDriftCount++;
        discrepancies.push({
          journalId: journal.id,
          type: journal.type,
          sumOfDebits: sumOfDebits.toString(),
          sumOfCredits: sumOfCredits.toString(),
        });

        await prisma.reconciliationDrift.create({
          data: {
            tenantId,
            accountId: `JOURNAL:${journal.id}`,
            driftAmount: sumOfDebits.sub(sumOfCredits),
            status: 'UNRESOLVED',
            notes: `Journal debits/credits mismatch. Debits: ${sumOfDebits}, Credits: ${sumOfCredits}`,
          },
        });
      }
    }

    return {
      authenticatedCount: journals.length,
      driftCount: totalDriftCount,
      discrepancies,
    };
  }
}
