import { SupplierConnection } from '../types/index';
import { SupplierStatus } from '../services/suppliers/types';

/**
 * Mock Decimal helper / standard wrapper for safe numeric representation
 */
export const Decimal: any = function(val: any) {
  if (!(this instanceof Decimal)) return new (Decimal as any)(val);
  this.value = val;
  this.lessThan = (amt: any) => Number(this.value) < Number(amt);
  this.toString = () => String(this.value);
  this.toNumber = () => Number(this.value);
};
export type Decimal = any;

export interface SupplierValidationResult {
  isValid: boolean;
  message?: string;
  metadata?: any;
}

export interface SupplierBalance {
  amount: Decimal;
  currency: string;
}

export interface SupplierOrderPayload {
  productCode: string;
  target: string;
  quantity: number;
  amount: number;
  orderId: string;
}

export interface SupplierOrderResult {
  supplierOrderId: string;
  status: SupplierStatus;
  rawResponse: any;
}

export interface SupplierResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: string;
}

/**
 * Unified abstract supplier adapter interface.
 * Implemented centrally with strict typing and DTO validations.
 */
export interface ISupplierAdapter {
  id: string;
  name: string;
  
  /**
   * Verifies credentials against provider API
   */
  validateCredentials(credentials: Partial<SupplierConnection>): Promise<SupplierValidationResult>;
  
  /**
   * Syncs and returns current provider deposit balance
   */
  syncBalance(credentials?: Partial<SupplierConnection>): Promise<SupplierResponse<SupplierBalance>>;
  
  /**
   * Syncs complete remote product catalog from provider
   */
  getProducts(credentials?: Partial<SupplierConnection>): Promise<any[]>;
  
  /**
   * Triggers background transaction ordering / topup dispatch
   */
  createOrder(
    params: SupplierOrderPayload & { credentials?: Partial<SupplierConnection> }
  ): Promise<SupplierResponse<SupplierOrderResult>>;
  
  /**
   * Dynamic check transaction state status
   */
  checkStatus(
    supplierOrderId: string,
    internalOrderId: string,
    credentials?: Partial<SupplierConnection>
  ): Promise<SupplierResponse<SupplierStatus>>;

  /**
   * Backward Compatibility Hooks
   */
  syncData?(connection: SupplierConnection): Promise<void>;
  placeOrder?(connection: SupplierConnection, product: any, quantity: number, targetUrl: string): Promise<{ externalOrderId: string }>;
}
