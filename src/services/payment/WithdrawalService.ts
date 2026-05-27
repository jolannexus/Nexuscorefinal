import { prisma } from '../../lib/prisma';
import { logger } from '../../lib/logger';
import { PayoutEngine } from './PayoutEngine';

export class WithdrawalService {
  /**
   * Submits a withdrawal request and triggers dynamic disbursement through Xendit/Midtrans PayoutEngine
   */
  static async requestWithdrawal(
    tenantId: string,
    walletId: string,
    amount: number,
    bankCode: string,
    accountNumber: string,
    accountName: string,
    description = 'Partner revenue payout'
  ) {
    if (amount <= 0) {
      throw new Error('Withdrawal amount must be postive.');
    }

    // 1. Create a dynamic withdrawal tracking record in PostgreSQL
    const withdrawal = await prisma.withdrawal.create({
      data: {
        walletId,
        amount,
        status: 'PENDING',
        bankAccount: `${bankCode}:${accountNumber}:${accountName}`,
      },
    });

    const correlationId = `wdr-corr-${withdrawal.id}`;

    try {
      // 2. Dispatch real Real-Money payment via PayoutEngine
      const payoutResult = await PayoutEngine.initiatePayout(
        tenantId,
        walletId,
        amount,
        bankCode,
        accountNumber,
        accountName,
        description,
        correlationId
      );

      // 3. Mark withdrawal record as APPROVED/COMPLETED
      await prisma.withdrawal.update({
        where: { id: withdrawal.id },
        data: {
          status: payoutResult.status === 'COMPLETED' ? 'APPROVED' : 'PENDING',
        },
      });

      logger.info({ withdrawalId: withdrawal.id, status: payoutResult.status }, 'Withdrawal request created and dispatched');

      return {
        withdrawalId: withdrawal.id,
        status: payoutResult.status === 'COMPLETED' ? 'COMPLETED' : 'PENDING',
        referenceId: payoutResult.referenceId,
      };
    } catch (err: any) {
      // Mark withdrawal as REJECTED since payout rejected or failed checks
      await prisma.withdrawal.update({
        where: { id: withdrawal.id },
        data: {
          status: 'REJECTED',
        },
      });

      logger.error({ err, withdrawalId: withdrawal.id }, 'Withdrawal request execution failed.');
      throw err;
    }
  }
}
