import { prisma } from '../../lib/prisma';
import { LedgerAccountType } from './LedgerEngine';
import { Prisma } from '@prisma/client';

export class LedgerAccountService {
  /**
   * Get balance for a specific account.
   * For abstract accounts like 'SYSTEM:REVENUE', this sums up entries.
   */
  static async getBalance(tenantId: string, accountId: string, type: LedgerAccountType): Promise<Prisma.Decimal> {
    const entries = await prisma.ledgerEntry.findMany({
      where: {
        tenantId,
        accountId,
      },
    });

    let balance = new Prisma.Decimal(0);
    for (const entry of entries) {
      if (entry.type === 'CREDIT') {
        balance = balance.add(entry.amount);
      } else {
        balance = balance.sub(entry.amount);
      }
    }
    return balance;
  }
}
