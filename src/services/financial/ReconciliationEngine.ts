import { prisma } from '../../lib/prisma';
import { Prisma } from '@prisma/client';
import { logger } from '../../lib/logger';
import { EventBus, EventTopic } from '../../lib/eventBus';
import { ledgerDoubleEntryErrors } from '../../lib/metrics';

export class ReconciliationEngine {
  static async reconcile(journalId: string, expectedAmount: Prisma.Decimal, actualAmount: Prisma.Decimal, notes?: string) {
    const status = expectedAmount.equals(actualAmount) ? 'MATCHED' : 'DISCREPANCY';
    
    // Fetch journal for tenantId
    const journal = await prisma.ledgerJournal.findUnique({ where: { id: journalId } });
    if (!journal) throw new Error('Journal not found');

    const record = await prisma.reconciliationRecord.create({
      data: {
        journalId,
        tenantId: journal.tenantId,
        status,
        expectedAmount,
        actualAmount,
        notes,
      },
    });

    if (status === 'DISCREPANCY') {
      logger.error({ journalId, expectedAmount, actualAmount }, 'Reconciliation discrepancy detected');
      ledgerDoubleEntryErrors.inc({ tenant_id: journal.tenantId, severity: 'HIGH' });

      await EventBus.publish(EventTopic.RECONCILIATION_REQUIRED, {
        tenantId: journal.tenantId,
        source: 'ReconciliationEngine',
        data: { journalId, expectedAmount, actualAmount },
        idempotencyKey: `recon_${journalId}_${new Date().getTime()}`
      });
    }

    return record;
  }
}

