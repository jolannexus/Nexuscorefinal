import { Prisma } from '@prisma/client';
import { LedgerEngine, LedgerAccountType } from './LedgerEngine';
import { prisma } from '../../lib/prisma';

export class SettlementManager {
  static async freezeBalance(tenantId: string, walletId: string, amount: Prisma.Decimal, orderId: string, idempotencyKey: string) {
    // 1. Double-Entry: Debit Wallet, Credit Frozen Balance
    await LedgerEngine.recordTransaction({
      tenantId,
      type: 'ORDER_FREEZE',
      description: `Freezing balance for order ${orderId}`,
      orderId,
      idempotencyKey,
      entries: [
        { accountId: walletId, accountType: LedgerAccountType.USER_WALLET, amount, type: 'DEBIT' },
        { accountId: walletId, accountType: LedgerAccountType.FROZEN_BALANCE, amount, type: 'CREDIT' },
      ],
    });
  }

  static async commitSettlement(
    tenantId: string, 
    walletId: string, 
    amount: Prisma.Decimal, 
    supplierSettlementAmount: Prisma.Decimal, 
    orderId: string, 
    idempotencyKey: string
  ) {
    const profitAmount = amount.sub(supplierSettlementAmount);

    return await prisma.$transaction(async (tx) => {
      // 1. Ledger Entry for Settlement
      await LedgerEngine.recordTransaction({
        tenantId,
        type: 'ORDER_SETTLEMENT',
        description: `Settling order ${orderId}`,
        orderId,
        idempotencyKey: `settle_${idempotencyKey}`,
        entries: [
          // Release from frozen
          { accountId: walletId, accountType: LedgerAccountType.FROZEN_BALANCE, type: 'DEBIT', amount: amount },
          
          // Pay supplier
          { accountId: 'SYSTEM_SUPPLIER', accountType: LedgerAccountType.SUPPLIER_SETTLEMENT, type: 'CREDIT', amount: supplierSettlementAmount },

          // Record Profit
          { accountId: 'SYSTEM_REVENUE', accountType: LedgerAccountType.SYSTEM_REVENUE, type: 'CREDIT', amount: profitAmount }
        ],
      });

      // 2. Create SettlementRecord
      const settlement = await tx.settlementRecord.create({
        data: {
          tenantId,
          transactionId: orderId,
          amount,
          supplierAmount: supplierSettlementAmount,
          profitAmount,
          status: 'COMPLETED',
          settledAt: new Date()
        }
      });

      return settlement;
    });
  }

  static async cancelFreeze(
    tenantId: string, 
    walletId: string, 
    amount: Prisma.Decimal, 
    orderId: string, 
    idempotencyKey: string
  ) {
    // 1. Double-Entry: Debit Frozen Balance, Credit UserWallet
    await LedgerEngine.recordTransaction({
      tenantId,
      type: 'ORDER_FREEZE_REVERSAL',
      description: `Reversing freeze for order ${orderId}`,
      orderId,
      idempotencyKey: `unfreeze_${idempotencyKey}`,
      entries: [
        { accountId: walletId, accountType: LedgerAccountType.FROZEN_BALANCE, amount, type: 'DEBIT' },
        { accountId: walletId, accountType: LedgerAccountType.USER_WALLET, amount, type: 'CREDIT' },
      ],
    });
  }
}
