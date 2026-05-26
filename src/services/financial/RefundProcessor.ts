import { Prisma } from '@prisma/client';
import { LedgerEngine, LedgerAccountType } from './LedgerEngine';
import { prisma } from '../../lib/prisma';
import { financialLogger } from '../../lib/logger';

export class RefundProcessor {
  static async processRefund(tenantId: string, walletId: string, amount: Prisma.Decimal, orderId: string, idempotencyKey: string) {
    // 1. Double-Entry: Debit SystemLiability, Credit UserWallet
    await LedgerEngine.recordTransaction({
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

    financialLogger.info({ orderId, amount: amount.toNumber() }, 'Refund processed successfully directly to user wallet');
  }
}
