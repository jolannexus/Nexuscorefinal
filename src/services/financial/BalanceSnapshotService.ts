import { prisma } from '../../lib/prisma';
import { Prisma } from '@prisma/client';
import { financialLogger } from '../../lib/logger';

export class BalanceSnapshotService {
  static async takeSnapshot(walletId: string) {
    return prisma.$transaction(async (tx) => {
      // 1. Get current wallet balance with NO KEY UPDATE
      const wallets = await tx.$queryRawUnsafe<any[]>(
        `SELECT id, balance, "frozenBalance" FROM "Wallet" WHERE id = '${walletId}' FOR NO KEY UPDATE`
      );
      if (wallets.length === 0) throw new Error('Wallet not found');

      const wallet = wallets[0];

      // 2. Fetch last snapshot periodEnd
      const lastSnapshot = await tx.balanceSnapshot.findFirst({
        where: { walletId },
        orderBy: { periodEnd: 'desc' }
      });

      const periodStart = lastSnapshot ? lastSnapshot.periodEnd : new Date(0);
      const periodEnd = new Date();

      // 3. Create snapshot
      const snapshot = await tx.balanceSnapshot.create({
        data: {
          walletId,
          periodStart,
          periodEnd,
          balance: wallet.balance,
          frozenBalance: wallet.frozenBalance,
        },
      });

      financialLogger.info({ walletId, snapshotId: snapshot.id, balance: wallet.balance.toString() }, 'Balance snapshot securely persisted');

      return snapshot;
    });
  }
}
