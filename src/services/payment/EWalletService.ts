import { prisma } from '../../lib/prisma';
import { logger } from '../../lib/logger';
import { PaymentGatewayManager } from './PaymentGatewayManager';
import { EWalletRequest } from './PaymentProviderAdapter';

export class EWalletService {
  /**
   * Charges an E-Wallet directly
   */
  static async chargeDepositEWallet(
    tenantId: string,
    walletId: string,
    amount: number,
    walletProvider: 'OVO' | 'DANA' | 'LINKAJA' | 'SHOPEEPAY',
    phoneNumber: string,
    callbackUrl?: string,
    preferredProvider?: 'midtrans' | 'xendit' | 'duitku'
  ) {
    const manager = PaymentGatewayManager.getInstance();
    const adapter = await manager.getBestAdapter(tenantId, preferredProvider);

    // 1. Create a PENDING Deposit
    const deposit = await prisma.deposit.create({
      data: {
        walletId,
        amount,
        status: 'PENDING',
        paymentMethod: walletProvider,
      },
    });

    try {
      const eWalletReq: EWalletRequest = {
        transactionId: deposit.id,
        amount,
        walletProvider,
        phoneNumber,
        callbackUrl,
      };

      const eWalletResponse = await adapter.chargeEWallet(tenantId, eWalletReq);

      // 2. Update reference ID
      await prisma.deposit.update({
        where: { id: deposit.id },
        data: {
          paymentRef: eWalletResponse.referenceId,
        },
      });

      logger.info(
        { depositId: deposit.id, walletProvider, provider: adapter.getName() },
        'E-wallet deposit requested successfully'
      );

      return {
        depositId: deposit.id,
        deeplinkUrl: eWalletResponse.deeplinkUrl,
        qrData: eWalletResponse.qrData,
        expirationDate: eWalletResponse.expirationDate,
        amount,
        provider: adapter.getName(),
      };
    } catch (err) {
      await manager.recordFailure(tenantId, adapter.getName());
      await prisma.deposit.update({
        where: { id: deposit.id },
        data: { status: 'FAILED' },
      });
      logger.error({ err, depositId: deposit.id }, 'E-wallet charge failed. Marked as FAILED.');
      throw err;
    }
  }
}
