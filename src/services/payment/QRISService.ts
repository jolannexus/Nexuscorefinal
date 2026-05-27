import { prisma } from '../../lib/prisma';
import { logger } from '../../lib/logger';
import { PaymentGatewayManager } from './PaymentGatewayManager';
import { QRRequest } from './PaymentProviderAdapter';

export class QRISService {
  /**
   * Generates a new dynamic QRIS for deposit funds
   */
  static async generateDepositQR(
    tenantId: string,
    walletId: string,
    amount: number,
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
        paymentMethod: 'QRIS',
      },
    });

    try {
      // 2. Call gateway adapter
      const qrReq: QRRequest = {
        transactionId: deposit.id,
        amount,
        customerName,
        customerEmail,
      };

      const qrResponse = await adapter.generateQRIS(tenantId, qrReq);

      // 3. Update Deposit with gateway reference ID
      await prisma.deposit.update({
        where: { id: deposit.id },
        data: {
          paymentRef: qrResponse.referenceId,
        },
      });

      logger.info(
        { depositId: deposit.id, provider: adapter.getName(), referenceId: qrResponse.referenceId },
        'Successfully initiated dynamic QRIS payment request'
      );

      return {
        depositId: deposit.id,
        qrData: qrResponse.qrData,
        expirationDate: qrResponse.expirationDate,
        amount,
        provider: adapter.getName(),
      };
    } catch (err) {
      await manager.recordFailure(tenantId, adapter.getName());
      // Update Deposit to FAILED
      await prisma.deposit.update({
        where: { id: deposit.id },
        data: { status: 'FAILED' },
      });
      logger.error({ err, depositId: deposit.id }, 'Failed to generate dynamic QRIS, marked as FAILED.');
      throw err;
    }
  }

  /**
   * Syncs the status of a QRIS payment with the gateway manually
   */
  static async syncQRISPaymentStatus(tenantId: string, depositId: string): Promise<string> {
    const deposit = await prisma.deposit.findUnique({
      where: { id: depositId },
    });

    if (!deposit || deposit.status !== 'PENDING') {
      return deposit?.status || 'NOT_FOUND';
    }

    const manager = PaymentGatewayManager.getInstance();
    const adapter = await manager.getBestAdapter(tenantId);

    try {
      const statusResult = await adapter.queryPaymentStatus(tenantId, deposit.id);

      if (statusResult.status === 'SETTLED') {
        // Trigger payment confirmation logic
        await prisma.deposit.update({
          where: { id: depositId },
          data: { status: 'SUCCESS' },
        });
        logger.info({ depositId }, 'Deposit payment matched SETTLED on gateway check. Status synchronized.');
        return 'SUCCESS';
      } else if (statusResult.status === 'EXPIRED') {
        await prisma.deposit.update({
          where: { id: depositId },
          data: { status: 'EXPIRED' },
        });
        return 'EXPIRED';
      }

      return 'PENDING';
    } catch (err) {
      logger.error({ err, depositId }, 'Error querying payment status of QRIS');
      return 'PENDING';
    }
  }
}
