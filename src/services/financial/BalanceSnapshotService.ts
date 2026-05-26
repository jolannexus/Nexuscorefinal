import { prisma } from '../../lib/prisma';
import { Prisma } from '@prisma/client';

export class BalanceSnapshotService {
  static async takeSnapshot(walletId: string) {
    // 1. Get current wallet balance
    const wallet = await prisma.wallet.findUnique({ where: { id: walletId } });
    if (!wallet) throw new Error('Wallet not found');

    // 2. Create snapshot
    return await prisma.balanceSnapshot.create({
      data: {
        walletId,
        periodStart: new Date(), // Simplified for now
        periodEnd: new Date(),
        balance: wallet.balance,
        frozenBalance: wallet.frozenBalance,
      },
    });
  }
}
