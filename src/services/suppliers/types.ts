// Mock Decimal for browser safety and bundling
export const Decimal: any = function(val: any) {
  if (!(this instanceof Decimal)) return new (Decimal as any)(val);
  this.value = val;
  this.lessThan = (amt: any) => Number(this.value) < Number(amt);
  this.toString = () => String(this.value);
  this.toNumber = () => Number(this.value);
};
export type Decimal = any;

export const SupplierStatus = {
  COMPLETED: 'COMPLETED',
  PROCESSING: 'PROCESSING',
  PENDING: 'PENDING',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED'
} as const;
export type SupplierStatus = typeof SupplierStatus[keyof typeof SupplierStatus];

export interface SupplierResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: string;
}

export interface SupplierBalance {
  amount: Decimal;
  currency: string;
}

export interface SupplierOrderResult {
  supplierOrderId: string;
  status: SupplierStatus;
  rawResponse: any;
}

export interface ISupplierAdapter {
  name: string;
  syncBalance(): Promise<SupplierResponse<SupplierBalance>>;
  createOrder(params: {
    productCode: string;
    target: string;
    quantity: number;
    amount: number;
    orderId: string;
  }): Promise<SupplierResponse<SupplierOrderResult>>;
  checkStatus(supplierOrderId: string, internalOrderId: string): Promise<SupplierResponse<SupplierStatus>>;
  validateCredentials(config: any): Promise<{ isValid: boolean; message?: string }>;
  getProducts?(): Promise<any[]>;
}
