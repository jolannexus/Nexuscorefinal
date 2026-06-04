import Redis from 'ioredis';
import { env } from './env';
import { logger } from './logger';

const globalForRedis = globalThis as unknown as { redisClient: Redis | undefined };

export function getRedisClient(): any {
  if (globalForRedis.redisClient) {
    return globalForRedis.redisClient;
  }

  const redisConfig: any = {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    lazyConnect: true,
    enableOfflineQueue: true,
    retryStrategy: (times: number) => {
      const delay = Math.min(times * 200, 3000);
      return delay;
    }
  };

  const url = env.REDIS_URL;

  const client = new Redis(url, redisConfig as any) as any;

  client.on('error', (err) => {
    logger.error(err, 'Redis connection error');
  });

  client.on('connect', () => {
    logger.info('Redis connected succesfully');
  });

  globalForRedis.redisClient = client as any;

  return client;
}

