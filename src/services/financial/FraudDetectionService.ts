import { getRedisClient } from '../../lib/redis';
import { logger } from '../../lib/logger';
import { Prisma } from '@prisma/client';
import { LedgerAuditService } from './LedgerAuditService';
import { prisma } from '../../lib/prisma';

export const FraudRules = {
  MAX_DAILY_PAYOUT_AMOUNT: 500000000,   // 500 million IDR
  MAX_PAYOUTS_PER_HOUR: 10,
  MAX_DAILY_DEPOSIT_VELOCITY: 50        // 50 deposits max per day per wallet
};

/**
 * Foundation for Realtime Fraud & Anomaly Detection
 */
export class FraudDetectionService {
  /**
   * Evaluates payout anomalies based on velocity and thresholds
   */
  static async evaluatePayoutRisk(tenantId: string, walletId: string, amount: Prisma.Decimal | number): Promise<boolean> {
    const decimalAmount = new Prisma.Decimal(amount);
    const redis = getRedisClient();
    const today = new Date().toISOString().split('T')[0];

    try {
      // 1. Daily Amount Velocity
      const dailyKey = `fraud:payout:daily_vol:${walletId}:${today}`;
      const currentVolStr = await redis.get(dailyKey);
      const currentVol = currentVolStr ? new Prisma.Decimal(currentVolStr) : new Prisma.Decimal(0);
      
      const newVol = currentVol.add(decimalAmount);
      if (newVol.greaterThan(FraudRules.MAX_DAILY_PAYOUT_AMOUNT)) {
        logger.error({ tenantId, walletId, amount: decimalAmount.toString() }, 'FRAUD DETECTED: Daily payout volume exceeded');
        await this.logFraudEvent(tenantId, walletId, 'DAILY_VOLUME_EXCEEDED');
        return false;
      }

      // 2. High frequency Velocity
      const hourKey = `fraud:payout:freq_hr:${walletId}:${new Date().getHours()}`;
      const count = await redis.incr(hourKey);
      if (count === 1) await redis.expire(hourKey, 3600);
      
      if (count > FraudRules.MAX_PAYOUTS_PER_HOUR) {
        logger.error({ tenantId, walletId, count }, 'FRAUD DETECTED: Hourly payout frequency exceeded');
        await this.logFraudEvent(tenantId, walletId, 'HOURLY_FREQUENCY_EXCEEDED');
        return false;
      }

      // Record daily volume addition
      if (currentVolStr === null) {
        await redis.set(dailyKey, newVol.toString(), 'EX', 86400); // 24hr expiry
      } else {
        await redis.set(dailyKey, newVol.toString());
      }

      return true;
    } catch (err) {
      logger.error(err, 'Failed to evaluate fraud risk');
      return true; // Fail open but logged
    }
  }

  private static async logFraudEvent(tenantId: string, walletId: string, reason: string) {
    try {
      await prisma.$transaction(async (tx) => {
         await LedgerAuditService.logEvent(
            tx,
            tenantId,
            'FRAUD_ALERT',
            JSON.stringify({ walletId, reason }),
            'CRITICAL',
            `fraud_detect_${walletId}_${Date.now()}`
         );
      });
    } catch (err) {
      logger.error(err, 'Could not log fraud event to database');
    }
  }
}
