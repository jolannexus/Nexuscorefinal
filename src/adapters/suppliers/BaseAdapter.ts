import { ISupplierAdapter, SupplierValidationResult, SupplierResponse, SupplierBalance, SupplierOrderResult } from '../../components/ISupplierAdapter';
import { SupplierStatus } from '../../services/suppliers/types';
import { SupplierConnection } from '../../types/index';

export abstract class BaseAdapter implements ISupplierAdapter {
  abstract id: string;
  abstract name: string;
  protected config: any;

  constructor(config?: any) {
    this.config = config || {};
  }

  abstract validateCredentials(credentials: Partial<SupplierConnection>): Promise<SupplierValidationResult>;
  
  abstract syncBalance(credentials?: Partial<SupplierConnection>): Promise<SupplierResponse<SupplierBalance>>;
  
  abstract getProducts(credentials?: Partial<SupplierConnection>): Promise<any[]>;
  
  abstract createOrder(
    params: {
      productCode: string;
      target: string;
      quantity: number;
      amount: number;
      orderId: string;
      credentials?: Partial<SupplierConnection>;
    }
  ): Promise<SupplierResponse<SupplierOrderResult>>;
  
  abstract checkStatus(
    supplierOrderId: string,
    internalOrderId: string,
    credentials?: Partial<SupplierConnection>
  ): Promise<SupplierResponse<SupplierStatus>>;

  /**
   * Helper payload extractor returning either parameters explicitly passed or constructor config
   */
  protected getCredentials(credentials?: Partial<SupplierConnection>): { apiKey: string; secretKey: string; username: string; resellerId: string } {
    const active = credentials || {};
    return {
      apiKey: active.apiKey || this.config.apiKey || '',
      secretKey: active.secretKey || this.config.secretKey || (active as any).webhookSecret || this.config.webhookSecret || '',
      username: (active as any).username || this.config.username || (active as any).accessToken || this.config.accessToken || '',
      resellerId: active.resellerId || this.config.resellerId || ''
    };
  }

  /**
   * Safe Fetch with AbortController timeout execution
   */
  protected async fetchWithTimeout(url: string, options: RequestInit, timeoutMs = 15000): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        throw new Error(`[${this.name}] Endpoint request to ${url} timed out after ${timeoutMs}ms`);
      }
      throw err;
    }
  }

  /**
   * Universal retry wrapper with exponential backoff
   */
  protected async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    initialDelay: number = 1000
  ): Promise<T> {
    let lastError: any;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        const delay = initialDelay * Math.pow(2, attempt);
        console.warn(`[${this.name}] Attempt ${attempt + 1} failed. Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
  }
}
