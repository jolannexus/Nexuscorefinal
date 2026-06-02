import { Request } from 'express';
import { logger } from '../../lib/logger';

export interface TransactionContext {
  ipAddress: string;
  userAgent: string;
  deviceId?: string;
  tenantId: string;
}

export class FraudDetectionService {
  /**
   * Scans a transaction for potential fraud based on device/IP patterns.
   * Returns a risk score from 0 (Safe) to 100 (High Risk).
   */
  static async getRiskScore(context: TransactionContext): Promise<number> {
    let riskScore = 0;

    // Simulate anomaly checks (In reality, connect to Redis for velocity/geolocation history)
    
    // 1. Check if IP is suspicious (e.g., known proxy/vpn) - placeholder logic
    if (context.ipAddress === '0.0.0.0') {
      riskScore += 20;
    }

    // 2. Check device anomalies
    if (!context.deviceId) {
      riskScore += 10;
    }

    logger.info(`[FraudDetection] Risk score calculated for tenant ${context.tenantId}: ${riskScore}`);
    
    return riskScore;
  }

  static async isTransactionSafe(context: TransactionContext): Promise<boolean> {
    const score = await this.getRiskScore(context);
    return score < 50; // Threshold for rejection
  }
}
