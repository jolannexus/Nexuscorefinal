import { Prisma } from '@prisma/client';
import { LedgerEngine, LedgerAccountType } from './LedgerEngine';
import { prisma } from '../../lib/prisma';
import { logger } from '../../lib/logger';

export class RefundProcessor {
  static async processRefund(tenantId: string, walletId: string, amount: Prisma.Decimal, orderId: string, idempotencyKey: string) {
    // 1. Double-Entry: Debit SystemLiability, Credit UserWallet
    await LedgerEngine.createJournal({
      tenantId,
      type: 'REFUND_CREDIT',
      description: `Refund credit for order ${orderId}`,
      orderId,
      idempotencyKey,
      entries: [
        { accountId: 'SYSTEM_LIABILITY', accountType: LedgerAccountType.SYSTEM_LIABILITY, amount, type: 'DEBIT' },
        { accountId: walletId, accountType: LedgerAccountType.USER_WALLET, amount, type: 'CREDIT' },
      ],
    });

    // 2. Atomic Wallet Update
    await prisma.wallet.update({
      where: { id: walletId },
      data: {
        balance: { increment: amount },
      }
    });

    logger.info({ orderId, amount }, 'Refund processed successfully');
  }
}
