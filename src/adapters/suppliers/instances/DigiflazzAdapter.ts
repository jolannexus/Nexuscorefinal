import { BaseAdapter } from '../BaseAdapter';
import { SupplierValidationResult, SupplierResponse, SupplierBalance, SupplierOrderResult, Decimal } from '../../../components/ISupplierAdapter';
import { SupplierStatus } from '../../../services/suppliers/types';
import { SupplierConnection } from '../../../types/index';
import CryptoJS from 'crypto-js';

export class DigiflazzAdapter extends BaseAdapter {
  id = 'digiflazz';
  name = 'Digiflazz';
  private baseUrl = 'https://api.digiflazz.com/v1';

  constructor(config?: { username: string; apiKey: string; baseUrl?: string; testing?: boolean }) {
    super(config);
    if (config?.baseUrl) {
      this.baseUrl = config.baseUrl;
    }
  }

  /**
   * Generates MD5 signature for Digiflazz API authentication
   * Format: MD5(username + apiKey + suffix)
   */
  private generateSignature(username: string, apiKey: string, suffix: string): string {
    return CryptoJS.MD5(username + apiKey + suffix).toString();
  }

  /**
   * Maps Indonesian status labels and standard RC codes to unified SupplierStatus
   */
  private mapStatus(statusStr: string, rc?: string): SupplierStatus {
    if (!statusStr) {
      if (rc === '00') return SupplierStatus.COMPLETED;
      if (rc === '03' || rc === '05') return SupplierStatus.PROCESSING;
      if (rc && rc !== '00' && rc !== '03' && rc !== '05') return SupplierStatus.FAILED;
      return SupplierStatus.PENDING;
    }

    const normalized = statusStr.toLowerCase();
    
    // Status mappings
    if (normalized === 'sukses' || normalized === 'success') {
      return SupplierStatus.COMPLETED;
    }
    if (
      normalized === 'gagal' || 
      normalized === 'failed' || 
      normalized === 'gagal / refund' || 
      normalized === 'blocked' || 
      normalized === 'error'
    ) {
      return SupplierStatus.FAILED;
    }
    if (normalized === 'pending' || normalized === 'processing' || normalized === 'proses' || normalized === 'sedang diproses') {
      return SupplierStatus.PROCESSING;
    }

    // Fallback on Response Code (rc)
    if (rc) {
      if (rc === '00') return SupplierStatus.COMPLETED;
      if (rc === '03' || rc === '05') return SupplierStatus.PROCESSING;
      return SupplierStatus.FAILED;
    }

    return SupplierStatus.PROCESSING;
  }

  /**
   * Verifies credentials against provider API
   */
  async validateCredentials(credentials: Partial<SupplierConnection>): Promise<SupplierValidationResult> {
    const { apiKey, username, resellerId } = this.getCredentials(credentials);
    const activeUsername = resellerId || username;

    if (!activeUsername || !apiKey) {
      return { isValid: false, message: 'Username (Reseller ID) and API Key are required.' };
    }

    try {
      const sign = this.generateSignature(activeUsername, apiKey, 'depo');
      const response = await this.fetchWithTimeout(`${this.baseUrl}/cek-saldo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cmd: 'depo',
          username: activeUsername,
          sign: sign
        })
      }, 8000);

      const result = await response.json();
      
      if (result.data) {
        const rc = result.data.rc || result.rc;
        if (rc === '00' || result.data.deposit !== undefined) {
          return {
            isValid: true,
            message: 'Connection established successfully with Digiflazz.',
            metadata: { balance: result.data.deposit }
          };
        }
        return {
          isValid: false,
          message: result.data?.message || result.message || `Failed to authenticate. RC: ${rc}`
        };
      }

      return {
        isValid: false,
        message: result.message || 'Malformed balance response: Missing data payload block.'
      };
    } catch (error: any) {
      console.error('Digiflazz credentials validation error:', error);
      return { isValid: false, message: `Network error connecting to Digiflazz: ${error.message}` };
    }
  }

  /**
   * Syncs and returns current provider deposit balance
   */
  async syncBalance(credentials?: Partial<SupplierConnection>): Promise<SupplierResponse<SupplierBalance>> {
    const { apiKey, username, resellerId } = this.getCredentials(credentials);
    const activeUsername = resellerId || username;

    console.info(`[${this.name}] Querying deposit balance...`);
    
    return this.withRetry(async () => {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/cek-saldo`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          cmd: 'depo',
          username: activeUsername,
          sign: this.generateSignature(activeUsername, apiKey, 'depo')
        })
      });

      if (!response.ok) {
        throw new Error(`Digiflazz Balance API returned non-200 state: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.data) {
        const rc = result.data.rc || result.rc;
        const message = result.data.message || result.message;

        if (rc === '00' || result.data.deposit !== undefined) {
          const rawAmount = result.data.deposit;
          return {
            success: true,
            data: { 
              amount: new Decimal(rawAmount), 
              currency: 'IDR' 
            }
          };
        }
        throw new Error(message || `Failed to fetch balance. RC: ${rc}`);
      }

      throw new Error('Malformed balance response: Missing root data block');
    });
  }

  /**
   * Syncs complete remote product catalog from provider
   */
  async getProducts(credentials?: Partial<SupplierConnection>): Promise<any[]> {
    const { apiKey, username, resellerId } = this.getCredentials(credentials);
    const activeUsername = resellerId || username;

    console.info(`[${this.name}] Syncing catalog pricelist catalog...`);
    
    return this.withRetry(async () => {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/price-list`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          cmd: 'prepaid',
          username: activeUsername,
          sign: this.generateSignature(activeUsername, apiKey, 'pricelist')
        })
      });

      if (!response.ok) {
        throw new Error(`Digiflazz PriceList API returned HTTP ${response.status}`);
      }

      const result = await response.json();
      if (result.data && Array.isArray(result.data)) {
        return result.data.map((item: any) => ({
          id: item.buyer_sku_code,
          type: item.category || 'prepaid',
          brand: item.brand,
          name: item.product_name,
          basePrice: item.price,
          category: item.type || 'prepaid',
          isActive: item.seller_product_status === true && item.buyer_product_status === true,
          supplier: 'DIGIFLAZZ'
        }));
      }
      return [];
    });
  }

  /**
   * Triggers background transaction ordering / topup dispatch
   */
  async createOrder(params: {
    productCode: string;
    target: string;
    quantity: number;
    amount: number;
    orderId: string;
    credentials?: Partial<SupplierConnection>;
  }): Promise<SupplierResponse<SupplierOrderResult>> {
    const { apiKey, username, resellerId } = this.getCredentials(params.credentials);
    const activeUsername = resellerId || username;

    console.info(`[${this.name}] Placing order: ${params.orderId} (Product: ${params.productCode}, Target: ${params.target})`);

    return this.withRetry(async () => {
      const payload: any = {
        username: activeUsername,
        buyer_sku_code: params.productCode,
        customer_no: params.target,
        ref_id: params.orderId,
        sign: this.generateSignature(activeUsername, apiKey, params.orderId)
      };

      if (this.config.testing) {
        payload.testing = true;
      }

      const response = await this.fetchWithTimeout(`${this.baseUrl}/transaction`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Digiflazz Order API returned HTTP ${response.status}`);
      }

      const result = await response.json();
      
      if (result.data) {
        const data = result.data;
        const mappedStatus = this.mapStatus(data.status, data.rc);

        return {
          success: true,
          data: {
            supplierOrderId: data.trx_id || `DF-${params.orderId}`,
            status: mappedStatus,
            rawResponse: data
          }
        };
      }

      const failMessage = result.message || (result.data && result.data.message) || 'Order placement failed at Digiflazz';
      throw new Error(failMessage);
    });
  }

  /**
   * Dynamic check transaction state status
   */
  async checkStatus(
    supplierOrderId: string,
    internalOrderId: string,
    credentials?: Partial<SupplierConnection>
  ): Promise<SupplierResponse<SupplierStatus>> {
    const { apiKey, username, resellerId } = this.getCredentials(credentials);
    const activeUsername = resellerId || username;

    console.info(`[${this.name}] Verification sync checking status: ${internalOrderId}`);
    
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/transaction`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          username: activeUsername,
          buyer_sku_code: 'status',
          customer_no: 'status',
          ref_id: internalOrderId,
          sign: this.generateSignature(activeUsername, apiKey, internalOrderId)
        })
      });

      if (!response.ok) {
        return { success: false, error: `Digiflazz status API returned HTTP ${response.status}` };
      }

      const result = await response.json();
      if (result.data) {
        const mappedStatus = this.mapStatus(result.data.status, result.data.rc);
        return { 
          success: true, 
          data: mappedStatus 
        };
      }

      return { success: false, error: result.message || 'Empty response block' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Unknown network check status error' };
    }
  }

  // Backward compatibility mock
  async syncData(connection: SupplierConnection): Promise<void> {
    console.log(`[Digiflazz] syncData shim triggered.`);
    await this.getProducts(connection);
  }

  async placeOrder(connection: SupplierConnection, product: any, quantity: number, targetUrl: string): Promise<{ externalOrderId: string }> {
    const res = await this.createOrder({
      productCode: product.externalId || product.productCode,
      target: targetUrl,
      quantity,
      amount: product.price || 0,
      orderId: `ORD-${Date.now()}`,
      credentials: connection
    });

    if (res.success && res.data) {
      return { externalOrderId: res.data.supplierOrderId };
    }
    throw new Error(res.error || 'Failed placing order via placeOrder shim');
  }
}
