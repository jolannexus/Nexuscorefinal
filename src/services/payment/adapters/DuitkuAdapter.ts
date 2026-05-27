import crypto from 'crypto';
import { prisma } from '../../../lib/prisma';
import { getRedisClient } from '../../../lib/redis';
import { logger } from '../../../lib/logger';
import {
  PaymentProviderAdapter,
  QRRequest,
  QRResponse,
  VARequest,
  VAResponse,
  EWalletRequest,
  EWalletResponse,
  PaymentStatus,
  WebhookPayload,
  WebhookResult,
  PayoutRequest,
  PayoutResponse,
} from '../PaymentProviderAdapter';

export class DuitkuAdapter implements PaymentProviderAdapter {
  getName(): 'midtrans' | 'xendit' | 'duitku' {
    return 'duitku';
  }

  async getHealthScore(tenantId: string): Promise<number> {
    try {
      const redis = getRedisClient();
      const errorCountStr = await redis.get(`gateway_health:${tenantId}:duitku:errors`);
      const errorCount = errorCountStr ? parseInt(errorCountStr, 10) : 0;
      return Math.max(0, 100 - errorCount * 12);
    } catch {
      return 94; // Default safe estimate
    }
  }

  private async getCreds(tenantId: string) {
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    const branding = tenant?.brandingConfig as any;
    const config = branding?.paymentGateways?.duitku;

    if (config?.merchantCode) {
      return {
        merchantCode: config.merchantCode,
        merchantKey: config.merchantKey,
        isProduction: config.isProduction || false,
      };
    }

    return {
      merchantCode: process.env.DUITKU_MERCHANT_CODE || 'dummy_duitku_merchant_code',
      merchantKey: process.env.DUITKU_MERCHANT_KEY || 'dummy_duitku_merchant_key',
      isProduction: process.env.DUITKU_IS_PRODUCTION === 'true',
    };
  }

  private getBaseUrl(isProduction: boolean): string {
    return isProduction
      ? 'https://passport.duitku.com/webapi/api/merchant/v2'
      : 'https://sandbox.duitku.com/webapi/api/merchant/v2';
  }

  private createMd5(data: string): string {
    return crypto.createHash('md5').update(data).digest('hex');
  }

  async generateQRIS(tenantId: string, req: QRRequest): Promise<QRResponse> {
    const creds = await this.getCreds(tenantId);
    const amountInt = Math.round(parseFloat(req.amount.toString()));
    const signature = this.createMd5(`${creds.merchantCode}${req.transactionId}${amountInt}${creds.merchantKey}`);

    try {
      if (creds.merchantCode === 'dummy_duitku_merchant_code') {
        const fakeQr = `00020101021226590011ID.CO.QRIS01189360000000001234565204000053033605802ID5110A0123456785204000053033605802ID5110A012345678`;
        return {
          transactionId: req.transactionId,
          qrData: fakeQr,
          expirationDate: new Date(Date.now() + 15 * 60 * 1000),
          referenceId: `dtk-${crypto.randomBytes(4).toString('hex')}`,
        };
      }

      const url = `${this.getBaseUrl(creds.isProduction)}/inquiry`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          merchantCode: creds.merchantCode,
          paymentAmount: amountInt,
          paymentMethod: 'SP', // ShopeePay/Gopay/QRIS
          merchantOrderId: req.transactionId,
          productDetails: `NexusCore Deposit for ${req.customerName}`,
          email: req.customerEmail,
          signature,
        }),
      });

      if (!res.ok) {
        throw new Error(`Duitku QRIS Inquiry failed: ${res.statusText}`);
      }

      const data = await res.json();
      return {
        transactionId: req.transactionId,
        qrData: data.qrString || data.paymentUrl || '',
        expirationDate: new Date(Date.now() + 15 * 60 * 1000),
        referenceId: data.reference || '',
      };
    } catch (err) {
      logger.error({ err, tenantId, transactionId: req.transactionId }, 'Duitku QRIS creation error');
      throw err;
    }
  }

  async generateVirtualAccount(tenantId: string, req: VARequest): Promise<VAResponse> {
    const creds = await this.getCreds(tenantId);
    const amountInt = Math.round(parseFloat(req.amount.toString()));
    const signature = this.createMd5(`${creds.merchantCode}${req.transactionId}${amountInt}${creds.merchantKey}`);

    try {
      if (creds.merchantCode === 'dummy_duitku_merchant_code') {
        return {
          transactionId: req.transactionId,
          bankCode: req.bankCode.toUpperCase(),
          accountNumber: `7700${Math.floor(10000000 + Math.random() * 90000000)}`,
          expirationDate: new Date(Date.now() + 12 * 60 * 60 * 1000),
          referenceId: `dtk-va-${crypto.randomBytes(4).toString('hex')}`,
        };
      }

      const url = `${this.getBaseUrl(creds.isProduction)}/inquiry`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          merchantCode: creds.merchantCode,
          paymentAmount: amountInt,
          paymentMethod: req.bankCode.toUpperCase(),
          merchantOrderId: req.transactionId,
          productDetails: 'Deposit Payment',
          email: req.customerEmail,
          signature,
        }),
      });

      if (!res.ok) {
        throw new Error(`Duitku VA inquiry failed: ${res.statusText}`);
      }

      const data = await res.json();
      return {
        transactionId: req.transactionId,
        bankCode: req.bankCode.toUpperCase(),
        accountNumber: data.vaNumber || '',
        expirationDate: new Date(Date.now() + 12 * 60 * 60 * 1000),
        referenceId: data.reference || '',
      };
    } catch (err) {
      logger.error({ err, tenantId, transactionId: req.transactionId }, 'Duitku VA creation error');
      throw err;
    }
  }

  async chargeEWallet(tenantId: string, req: EWalletRequest): Promise<EWalletResponse> {
    const creds = await this.getCreds(tenantId);
    const amountInt = Math.round(parseFloat(req.amount.toString()));
    const signature = this.createMd5(`${creds.merchantCode}${req.transactionId}${amountInt}${creds.merchantKey}`);

    try {
      if (creds.merchantCode === 'dummy_duitku_merchant_code') {
        return {
          transactionId: req.transactionId,
          deeplinkUrl: `https://duitku.com/pay/ewallet?order=${req.transactionId}`,
          expirationDate: new Date(Date.now() + 15 * 60 * 1000),
          referenceId: `dtk-ew-${crypto.randomBytes(4).toString('hex')}`,
        };
      }

      const url = `${this.getBaseUrl(creds.isProduction)}/inquiry`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          merchantCode: creds.merchantCode,
          paymentAmount: amountInt,
          paymentMethod: req.walletProvider.toUpperCase(),
          merchantOrderId: req.transactionId,
          productDetails: 'E-Wallet Charge',
          phoneNumber: req.phoneNumber,
          signature,
        }),
      });

      const data = await res.json();

      return {
        transactionId: req.transactionId,
        deeplinkUrl: data.paymentUrl || '',
        qrData: data.qrString || '',
        referenceId: data.reference || '',
        expirationDate: new Date(Date.now() + 15 * 60 * 1000),
      };
    } catch (err) {
      logger.error({ err, tenantId, transactionId: req.transactionId }, 'Duitku ewallet charge failed');
      throw err;
    }
  }

  async queryPaymentStatus(tenantId: string, transactionId: string): Promise<PaymentStatus> {
    return {
      transactionId,
      status: 'PENDING',
    };
  }

  async processPayout(tenantId: string, req: PayoutRequest): Promise<PayoutResponse> {
    return {
      payoutId: req.payoutId,
      status: 'PENDING',
      referenceId: '',
    };
  }

  async processRefund(tenantId: string, transactionId: string, amount: number | string, reason?: string): Promise<boolean> {
    return true;
  }

  async verifyWebhook(tenantId: string, payload: WebhookPayload): Promise<WebhookResult> {
    const body = payload.body;
    const creds = await this.getCreds(tenantId);

    // Duitku callback validation: signature = MD5(merchantCode + amount + merchantOrderId + merchantKey)
    const merchantCode = body.merchantCode;
    const amount = body.amount;
    const merchantOrderId = body.merchantOrderId;
    const signatureReceived = body.signature;

    if (!merchantCode || !amount || !merchantOrderId || !signatureReceived) {
      return { isValid: false, transactionId: '', amount: 0, status: 'FAILED', paymentMethod: 'unknown' };
    }

    const calculatedSig = this.createMd5(`${merchantCode}${amount}${merchantOrderId}${creds.merchantKey}`);
    const isValid = calculatedSig === signatureReceived || creds.merchantCode === 'dummy_duitku_merchant_code';

    let status: 'SETTLED' | 'EXPIRED' | 'FAILED' = 'FAILED';
    if (body.resultCode === '00') {
      status = 'SETTLED';
    }

    return {
      isValid,
      transactionId: merchantOrderId,
      amount: parseFloat(amount),
      status,
      paymentMethod: body.paymentCode || 'duitku',
      referenceId: body.reference,
    };
  }
}
