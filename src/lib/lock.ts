import { getRedisClient } from './redis';
import { logger } from './logger';
import crypto from 'crypto';

/**
 * Distributed Lock Safeguard using Redis SetNX
 * Prevents race conditions during financial operations
 */
export class DistributedLock {
  static async acquire(key: string, ttlSeconds: number = 30): Promise<string | null> {
    const client = getRedisClient();
    const token = crypto.randomUUID();
    const result = await client.set(key, token, 'EX', ttlSeconds, 'NX');
    if (result === 'OK') {
      return token;
    }
    return null;
  }

  static async release(key: string, token: string): Promise<boolean> {
    const client = getRedisClient();
    const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;
    const result = await client.eval(script, 1, key, token);
    return result === 1;
  }

  static async withLock<T>(key: string, ttlSeconds: number, fn: () => Promise<T>): Promise<T> {
    const lockKey = `lock:${key}`;
    const token = await this.acquire(lockKey, ttlSeconds);
    
    if (!token) {
      logger.warn({ lockKey }, 'Failed to acquire distributed lock');
      throw new Error('Resource is currently locked. Please try again.');
    }

    try {
      return await fn();
    } finally {
      const released = await this.release(lockKey, token);
      if (!released) {
        logger.error({ lockKey }, 'Failed to release distributed lock, or lock was unexpectedly overwritten');
      }
    }
  }
}
