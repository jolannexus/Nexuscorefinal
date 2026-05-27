import { prisma } from '../../lib/prisma';
import { logger } from '../../lib/logger';
import { PaymentGatewayManager } from './PaymentGatewayManager';
import { VARequest } from './PaymentProviderAdapter';

export class VirtualAccountService {
  /**
   * Generates a dynamic Virtual Account for billing deposits
   */
  static async generateDepositVA(
    tenantId: string,
    walletId: string,
    amount: number,
    bankCode: string, // e.g. BCA, MANDIRI, BRI, BNI
    customerName: string,
    customerEmail: string,
    preferredProvider?: 'midtrans' | 'xendit' | 'duitku'
  ) {
    const manager = PaymentGatewayManager.getInstance();
    const adapter = await manager.getBestAdapter(tenantId, preferredProvider);

    // 1. Create PENDING Deposit Record first
    const deposit = await prisma.deposit.create({
      data: {
        walletId,
        amount,
        status: 'PENDING',
        paymentMethod: `VA_${bankCode.toUpperCase()}`,
      },
    });

    try {
      // 2. Map request details
      const vaReq: VARequest = {
        transactionId: deposit.id,
        amount,
        bankCode,
        customerName,
        customerEmail,
      };

      const vaResponse = await adapter.generateVirtualAccount(tenantId, vaReq);

      // 3. Update Deposit with gateway reference info
      await prisma.deposit.update({
        where: { id: deposit.id },
        data: {
          paymentRef: vaResponse.referenceId,
        },
      });

      logger.info(
        { depositId: deposit.id, provider: adapter.getName(), vaNumber: vaResponse.accountNumber },
        'Successfully initiated virtual account invoice'
      );

      return {
        depositId: deposit.id,
        bankCode: vaResponse.bankCode,
        accountNumber: vaResponse.accountNumber,
        expirationDate: vaResponse.expirationDate,
        amount,
        provider: adapter.getName(),
      };
    } catch (err) {
      await manager.recordFailure(tenantId, adapter.getName());
      await prisma.deposit.update({
        where: { id: deposit.id },
        data: { status: 'FAILED' },
      });
      logger.error({ err, depositId: deposit.id }, 'Failed to generate Virtual Account, marked as FAILED.');
      throw err;
    }
  }
}
