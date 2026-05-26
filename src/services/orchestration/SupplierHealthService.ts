import { prisma } from '../../lib/prisma';
import { getRedisClient } from '../../lib/redis';
import { logger } from '../../lib/logger';

export class SupplierHealthService {
  static async updateHealth(supplierId: string, isSuccess: boolean, latency: number) {
    const key = `supplier:health:${supplierId}`;
    
    // Update local telemetry in Redis (sliding window)
    await getRedisClient().hincrby(key, isSuccess ? 'success' : 'failure', 1);
    await getRedisClient().lpush(`${key}:latency`, latency);
    await getRedisClient().ltrim(`${key}:latency`, 0, 99); // keep last 100
    
    // Log telemetry
    logger.debug({ supplierId, isSuccess, latency }, 'Supplier health telemetry updated');
  }

  static async getSupplierScore(supplierId: string): Promise<number> {
    const data = await getRedisClient().hgetall(`supplier:health:${supplierId}`);
    const success = parseInt(data.success || '0');
    const failure = parseInt(data.failure || '1'); // avoid div by zero
    return success / (success + failure);
  }
}
