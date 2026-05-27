import { Prisma } from '@prisma/client';
import crypto from 'crypto';
import { prisma } from '../../lib/prisma';
import { financialLogger } from '../../lib/logger';

export class LedgerAuditService {
  /**
   * Generates a deterministic SHA256 signature for a financial event.
   */
  static generateFingerprint(tenantId: string, action: string, details: string, createdAt: Date, previousFingerprint: string | null): string {
    const data = `${tenantId}|${action}|${details}|${createdAt.toISOString()}|${previousFingerprint || 'GENESIS'}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Logs a financial event into the FinancialAuditLog table with an immutable fingerprint signature.
   */
  static async logEvent(
    tx: Prisma.TransactionClient,
    tenantId: string,
    action: string,
    details: string,
    severity = 'INFO',
    correlationId?: string
  ) {
    const createdAt = new Date();

    // Fetch the structural Previous Fingerprint (most recent for tenant)
    const latestLog = await tx.financialAuditLog.findFirst({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      select: { fingerprint: true },
    });

    const previousFingerprint = latestLog?.fingerprint || null;
    const fingerprint = this.generateFingerprint(tenantId, action, details, createdAt, previousFingerprint);

    return await tx.financialAuditLog.create({
      data: {
        tenantId,
        action,
        details,
        severity,
        correlationId,
        fingerprint,
        createdAt,
      },
    });
  }

  /**
   * Verifies the cryptographic integrity of all log items for a tenant.
   * Checks if any entry has a tampered fingerprint.
   * Returns a list of corrupted audits (if any).
   */
  static async verifyAuditTrailIntegrity(tenantId: string): Promise<{ isValid: boolean; corruptLogIds: string[] }> {
    const logs = await prisma.financialAuditLog.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'asc' },
    });

    const corruptLogIds: string[] = [];
    let previousFingerprint: string | null = null;

    for (const log of logs) {
      const calculatedFingerprint = this.generateFingerprint(
        log.tenantId,
        log.action,
        log.details,
        log.createdAt,
        previousFingerprint
      );

      if (log.fingerprint !== calculatedFingerprint) {
        corruptLogIds.push(log.id);
      }
      previousFingerprint = log.fingerprint;
    }

    return {
      isValid: corruptLogIds.length === 0,
      corruptLogIds,
    };
  }
}
