import { Prisma } from '@prisma/client';

export interface QRRequest {
  transactionId: string;
  amount: number | string;
  customerName: string;
  customerEmail: string;
}

export interface QRResponse {
  transactionId: string;
  qrData: string; // RAW qr text or dynamic visual URL
  expirationDate: Date;
  referenceId: string;
}

export interface VARequest {
  transactionId: string;
  amount: number | string;
  bankCode: string; // e.g. BCA, MANDIRI, BRI, BNI
  customerName: string;
  customerEmail: string;
}

export interface VAResponse {
  transactionId: string;
  bankCode: string;
  accountNumber: string;
  expirationDate: Date;
  referenceId: string;
}

export interface EWalletRequest {
  transactionId: string;
  amount: number | string;
  walletProvider: 'OVO' | 'DANA' | 'LINKAJA' | 'SHOPEEPAY';
  phoneNumber: string;
  callbackUrl?: string;
}

export interface EWalletResponse {
  transactionId: string;
  deeplinkUrl?: string;
  qrData?: string;
  referenceId: string;
  expirationDate: Date;
}

export interface PaymentStatus {
  transactionId: string;
  status: 'PENDING' | 'SETTLED' | 'EXPIRED' | 'FAILED';
  paidAt?: Date;
  rawResponse?: any;
}

export interface WebhookPayload {
  headers: Record<string, string | string[] | undefined>;
  body: any;
}

export interface WebhookResult {
  isValid: boolean;
  transactionId: string;
  amount: number;
  status: 'SETTLED' | 'EXPIRED' | 'FAILED';
  paymentMethod: string;
  referenceId?: string;
}

export interface PayoutRequest {
  payoutId: string;
  amount: number | string;
  bankCode: string;
  accountNumber: string;
  accountName: string;
  description: string;
}

export interface PayoutResponse {
  payoutId: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  referenceId: string;
  failureReason?: string;
  completedAt?: Date;
}

export interface PaymentProviderAdapter {
  getName(): 'midtrans' | 'xendit' | 'duitku';
  getHealthScore(tenantId: string): Promise<number>;
  generateQRIS(tenantId: string, req: QRRequest): Promise<QRResponse>;
  generateVirtualAccount(tenantId: string, req: VARequest): Promise<VAResponse>;
  chargeEWallet(tenantId: string, req: EWalletRequest): Promise<EWalletResponse>;
  queryPaymentStatus(tenantId: string, transactionId: string): Promise<PaymentStatus>;
  processPayout(tenantId: string, req: PayoutRequest): Promise<PayoutResponse>;
  processRefund(tenantId: string, transactionId: string, amount: number | string, reason?: string): Promise<boolean>;
  verifyWebhook(tenantId: string, payload: WebhookPayload): Promise<WebhookResult>;
}
