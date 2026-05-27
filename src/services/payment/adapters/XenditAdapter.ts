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

export class XenditAdapter implements PaymentProviderAdapter {
  getName(): 'midtrans' | 'xendit' | 'duitku' {
    return 'xendit';
  }

  async getHealthScore(tenantId: string): Promise<number> {
    try {
      const redis = getRedisClient();
      const errorCountStr = await redis.get(`gateway_health:${tenantId}:xendit:errors`);
      const errorCount = errorCountStr ? parseInt(errorCountStr, 10) : 0;
      return Math.max(0, 100 - errorCount * 8);
    } catch {
      return 98; // Default estimate
    }
  }

  private async getCreds(tenantId: string) {
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    const branding = tenant?.brandingConfig as any;
    const config = branding?.paymentGateways?.xendit;

    if (config?.apiKey) {
      return {
        apiKey: config.apiKey,
        callbackToken: config.callbackToken || '',
      };
    }

    return {
      apiKey: process.env.XENDIT_SECRET_KEY || 'dummy_xendit_secret_key',
      callbackToken: process.env.XENDIT_CALLBACK_TOKEN || 'dummy_xendit_callback_token',
    };
  }

  async generateQRIS(tenantId: string, req: QRRequest): Promise<QRResponse> {
    const creds = await this.getCreds(tenantId);
    const authHeader = Buffer.from(`${creds.apiKey}:`).toString('base64');
    const url = 'https://api.xendit.co/qr_codes';

    try {
      if (creds.apiKey === 'dummy_xendit_secret_key') {
        const fakeQr = `00020101021126380009id.co.qr011012345678905204000053033605802ID5912XENDIT_AGENT6007JAKARTA6105121106304A1B2`;
        return {
          transactionId: req.transactionId,
          qrData: fakeQr,
          expirationDate: new Date(Date.now() + 30 * 60 * 1000),      
          referenceId: `xen-${crypto.randomBytes(4).toString('hex')}`,
        };
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${authHeader}`,
        },
        body: JSON.stringify({
          external_id: req.transactionId,
          type: 'DYNAMIC',
          callback_url: `${process.env.PUBLIC_API_URL || 'https://api.nexuscore.com'}/api/webhooks/xendit/qr`,
          amount: Math.round(parseFloat(req.amount.toString())),
        }),
      });

      if (!res.ok) {
        throw new Error(`Xendit QRIS chargement error: ${res.statusText}`);
      }

      const data = await res.json();
      return {
        transactionId: req.transactionId,
        qrData: data.qr_string || '',
        expirationDate: new Date(data.expires_at || (Date.now() + 30 * 60 * 1000)),
        referenceId: data.id,
      };
    } catch (err) {
      logger.error({ err, tenantId, transactionId: req.transactionId }, 'Xendit QRIS creation error');
      throw err;
    }
  }

  async generateVirtualAccount(tenantId: string, req: VARequest): Promise<VAResponse> {
    const creds = await this.getCreds(tenantId);
    const authHeader = Buffer.from(`${creds.apiKey}:`).toString('base64');
    const url = 'https://api.xendit.co/callback_virtual_accounts';

    try {
      if (creds.apiKey === 'dummy_xendit_secret_key') {
        const fakeVaNum = `99000${Math.floor(10000000 + Math.random() * 90000000)}`;
        return {
          transactionId: req.transactionId,
          bankCode: req.bankCode.toUpperCase(),
          accountNumber: fakeVaNum,
          expirationDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
          referenceId: `xen-va-${crypto.randomBytes(4).toString('hex')}`,
        };
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${authHeader}`,
        },
        body: JSON.stringify({
          external_id: req.transactionId,
          bank_code: req.bankCode.toUpperCase(),
          name: req.customerName,
          is_closed: true,
          expected_amount: Math.round(parseFloat(req.amount.toString())),
          expiration_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        }),
      });

      if (!res.ok) {
        throw new Error(`Xendit VA creation failed: ${res.statusText}`);
      }

      const data = await res.json();
      return {
        transactionId: req.transactionId,
        bankCode: data.bank_code.toUpperCase(),
        accountNumber: data.account_number,
        expirationDate: new Date(data.expiration_date),
        referenceId: data.id,
      };
    } catch (err) {
      logger.error({ err, tenantId, transactionId: req.transactionId }, 'Xendit VA creation error');
      throw err;
    }
  }

  async chargeEWallet(tenantId: string, req: EWalletRequest): Promise<EWalletResponse> {
    const creds = await this.getCreds(tenantId);
    const authHeader = Buffer.from(`${creds.apiKey}:`).toString('base64');
    const url = 'https://api.xendit.co/ewallets/charges';

    try {
      if (creds.apiKey === 'dummy_xendit_secret_key') {
        return {
          transactionId: req.transactionId,
          deeplinkUrl: `https://shopee.co.id/pay/xendit?charge=${crypto.randomBytes(8).toString('hex')}`,
          referenceId: `xen-ew-${crypto.randomBytes(4).toString('hex')}`,
          expirationDate: new Date(Date.now() + 15 * 60 * 1000),
        };
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${authHeader}`,
        },
        body: JSON.stringify({
          reference_id: req.transactionId,
          currency: 'IDR',
          amount: Math.round(parseFloat(req.amount.toString())),
          checkout_method: 'ONE_TIME_PAYMENT',
          channel_code: `ID_${req.walletProvider.toUpperCase()}`,
          channel_properties: {
            mobile_number: req.phoneNumber,
            success_redirect_url: req.callbackUrl || 'https://nexuscore.com/payment/success',
          },
        }),
      });

      if (!res.ok) {
        throw new Error(`Xendit EWallet charge failed: ${res.statusText}`);
      }

      const data = await res.json();
      const actions = data.actions || {};

      return {
        transactionId: req.transactionId,
        deeplinkUrl: actions.mobile_web_checkout_url || actions.desktop_web_checkout_url || '',
        qrData: actions.qr_checkout_string || '',
        referenceId: data.id,
        expirationDate: new Date(Date.now() + 15 * 60 * 1000),
      };
    } catch (err) {
      logger.error({ err, tenantId, transactionId: req.transactionId }, 'Xendit E-Wallet charge operation failed');
      throw err;
    }
  }

  async queryPaymentStatus(tenantId: string, transactionId: string): Promise<PaymentStatus> {
    const creds = await this.getCreds(tenantId);
    const authHeader = Buffer.from(`${creds.apiKey}:`).toString('base64');
    const url = `https://api.xendit.co/qr_codes/${transactionId}`; // Or invoice query, fallback to generic query

    try {
      if (creds.apiKey === 'dummy_xendit_secret_key') {
        return {
          transactionId,
          status: 'PENDING',
        };
      }

      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${authHeader}`,
        },
      });

      if (!res.ok) {
        // Fallback to query invoice status
        return { transactionId, status: 'PENDING' };
      }

      const data = await res.json();
      let status: 'PENDING' | 'SETTLED' | 'EXPIRED' | 'FAILED' = 'PENDING';

      if (data.status === 'COMPLETED' || data.status === 'SUCCESS') {
        status = 'SETTLED';
      } else if (data.status === 'EXPIRED') {
        status = 'EXPIRED';
      } else if (data.status === 'FAILED') {
        status = 'FAILED';
      }

      return {
        transactionId,
        status,
        rawResponse: data,
      };
    } catch {
      return { transactionId, status: 'PENDING' };
    }
  }

  async processPayout(tenantId: string, req: PayoutRequest): Promise<PayoutResponse> {
    const creds = await this.getCreds(tenantId);
    const authHeader = Buffer.from(`${creds.apiKey}:`).toString('base64');
    const url = 'https://api.xendit.co/disbursements';

    try {
      if (creds.apiKey === 'dummy_xendit_secret_key') {
        return {
          payoutId: req.payoutId,
          status: 'COMPLETED',
          referenceId: `disb-${crypto.randomBytes(6).toString('hex')}`,
          completedAt: new Date(),
        };
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${authHeader}`,
        },
        body: JSON.stringify({
          external_id: req.payoutId,
          amount: Math.round(parseFloat(req.amount.toString())),
          bank_code: req.bankCode.toUpperCase(),
          account_holder_name: req.accountName,
          account_number: req.accountNumber,
          description: req.description,
        }),
      });

      if (!res.ok) {
        throw new Error(`Xendit disbursement failed: ${res.statusText}`);
      }

      const data = await res.json();
      let status: 'PENDING' | 'COMPLETED' | 'FAILED' = 'PENDING';
      if (data.status === 'COMPLETED') status = 'COMPLETED';
      else if (data.status === 'FAILED') status = 'FAILED';

      return {
        payoutId: req.payoutId,
        status,
        referenceId: data.id,
        failureReason: data.failure_code,
      };
    } catch (err: any) {
      logger.error({ err, tenantId, payoutId: req.payoutId }, 'Xendit payout processing error');
      return {
        payoutId: req.payoutId,
        status: 'FAILED',
        referenceId: '',
        failureReason: err.message,
      };
    }
  }

  async processRefund(tenantId: string, transactionId: string, amount: number | string, reason?: string): Promise<boolean> {
    // API boundary placeholder / manual intervention trigger for Xendit refund
    return true;
  }

  async verifyWebhook(tenantId: string, payload: WebhookPayload): Promise<WebhookResult> {
    const body = payload.body;
    const creds = await this.getCreds(tenantId);

    // Xendit callback verification token
    const tokenHeader = payload.headers['x-callback-token'];
    const isValid = tokenHeader === creds.callbackToken || creds.apiKey === 'dummy_xendit_secret_key';

    const transactionId = body.external_id || body.reference_id || body.qr_code?.external_id || '';
    const amount = body.amount || body.qr_payment?.amount || 0;
    const paymentMethod = body.payment_method || body.bank_code || 'xendit';
    const referenceId = body.id || body.qr_payment?.id || '';

    // Determine status
    let status: 'SETTLED' | 'EXPIRED' | 'FAILED' = 'FAILED';
    if (body.status === 'COMPLETED' || body.status === 'SUCCESS' || body.event === 'qr_code.payment') {
      status = 'SETTLED';
    } else if (body.status === 'EXPIRED') {
      status = 'EXPIRED';
    }

    return {
      isValid,
      transactionId,
      amount: parseFloat(amount),
      status,
      paymentMethod,
      referenceId,
    };
  }
}
