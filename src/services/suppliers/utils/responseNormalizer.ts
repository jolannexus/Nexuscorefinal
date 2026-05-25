import { SupplierResponse, SupplierStatus } from '../types';

export interface NormalizerOptions {
  timeoutMs?: number;
  providerName: string;
  defaultStatus?: SupplierStatus;
}

/**
 * Standard interface for Raw Response Payload extraction
 */
export interface RawSupplierPayload {
  status?: string;
  rc?: string;
  code?: string;
  message?: string;
  trx_id?: string;
  ref_id?: string;
  [key: string]: any;
}

/**
 * Enterprise Supplier Response and Error Normalization Utility
 * Designed for strict type-safety, async safety, and uniform diagnostic tracking.
 */
export class SupplierResponseNormalizer {
  
  /**
   * Safe dictionary for converting Indonesian supplier status words to enterprise SupplierStatus
   */
  private static statusDictionary: Record<string, SupplierStatus> = {
    // Digiflazz & Indomedian Common Terms
    'sukses': SupplierStatus.COMPLETED,
    'success': SupplierStatus.COMPLETED,
    'gagal': SupplierStatus.FAILED,
    'failed': SupplierStatus.FAILED,
    'gagal / refund': SupplierStatus.FAILED,
    'batal': SupplierStatus.CANCELLED,
    'cancelled': SupplierStatus.CANCELLED,
    'refunded': SupplierStatus.REFUNDED,
    'proses': SupplierStatus.PROCESSING,
    'proses / pending': SupplierStatus.PROCESSING,
    'sedang diproses': SupplierStatus.PROCESSING,
    'processing': SupplierStatus.PROCESSING,
    'pending': SupplierStatus.PENDING,
    'blocked': SupplierStatus.FAILED,
    'error': SupplierStatus.FAILED,

    // VIP-Reseller specific
    'completed': SupplierStatus.COMPLETED,
    'partial': SupplierStatus.FAILED,
  };

  /**
   * Helper mapping from numeric response codes (RC) to SupplierStatus
   */
  private static rcDictionary: Record<string, SupplierStatus> = {
    '00': SupplierStatus.COMPLETED,  // Success
    '03': SupplierStatus.PROCESSING, // Processing/Pending
    '05': SupplierStatus.PROCESSING, // Suspended / Waiting status
    'default_fail': SupplierStatus.FAILED
  };

  /**
   * Translates status codes or descriptive Indonesian/English text to SupplierStatus
   */
  public static normalizeStatus(rawStatus?: string, rc?: string, defaultStatus = SupplierStatus.PROCESSING): SupplierStatus {
    // 1. Check direct string dictionary match
    if (rawStatus) {
      const normalizedStatus = rawStatus.trim().toLowerCase();
      if (this.statusDictionary[normalizedStatus]) {
        return this.statusDictionary[normalizedStatus];
      }
    }

    // 2. Check response code (RC) match
    if (rc) {
      const normalizedRc = rc.trim();
      if (this.rcDictionary[normalizedRc]) {
        return this.rcDictionary[normalizedRc];
      }
    }

    return defaultStatus;
  }

  /**
   * Normalizes raw error signatures or exceptions into a strict API response contracts
   */
  public static normalizeError(error: any, providerName: string): SupplierResponse<never> {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`[SupplierResponseNormalizer] [${providerName}] Processing runtime error: ${errorMsg}`);

    let statusCode = '500';
    if (errorMsg.includes('timed out') || errorMsg.includes('TimeoutError')) {
      statusCode = '408'; // Request Timeout
    } else if (errorMsg.includes('DNS') || errorMsg.includes('fetch failed')) {
      statusCode = '502'; // Bad Gateway / Network Failure
    } else if (errorMsg.includes('401') || errorMsg.includes('Unauthorized') || errorMsg.includes('Forbidden')) {
      statusCode = '401';
    }

    return {
      success: false,
      error: `[${providerName}] ${errorMsg}`,
      statusCode,
    };
  }

  /**
   * Wrapper execute utility ensuring promise execution with a rigid timeout constraint
   */
  public static async executeWithTimeout<T>(
    promise: Promise<T>,
    timeoutMs = 15000,
    providerName = 'Generic'
  ): Promise<T> {
    const timeout = new Promise<never>((_, reject) => {
      const timer = setTimeout(() => {
        clearTimeout(timer);
        reject(new Error(`Supplier connection timeout of ${timeoutMs}ms exceeded`));
      }, timeoutMs);
    });

    return Promise.race([promise, timeout]);
  }

  /**
   * Full asynchronous safety wrapper.
   * Resolves any promise successfully or gracefully catches and normalizes its internal failures.
   */
  public static async safeNormalize<T>(
    operation: () => Promise<any>,
    options: NormalizerOptions
  ): Promise<SupplierResponse<T>> {
    const { providerName, timeoutMs = 15000 } = options;

    try {
      // Run operation safely under the threshold
      const rawResult = await this.executeWithTimeout(operation(), timeoutMs, providerName);

      // Check if it's already a normalized response
      if (rawResult && typeof rawResult === 'object' && 'success' in rawResult) {
        return rawResult as SupplierResponse<T>;
      }

      // Return wrapping it cleanly
      return {
        success: true,
        data: rawResult as T,
        statusCode: '200',
      };
    } catch (err: any) {
      return this.normalizeError(err, providerName) as any;
    }
  }
}
