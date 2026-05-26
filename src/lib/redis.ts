import Redis from 'ioredis';
import { env } from './env';
import { logger } from './logger';

let client: Redis | null = null;

export function getRedisClient(forceNew = false): Redis {
  const redisConfig: any = {
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
    enableOfflineQueue: true,
    retryStrategy: (times: number) => {
      // Linear-exponential backoff: retry and cap at 3000ms delay
      const delay = Math.min(times * 200, 3000);
      return delay;
    }
  };

  const url = env.REDIS_URL;

  if (forceNew) {
    return new Redis(url, redisConfig);
  }

  if (!client) {
    client = new Redis(url, redisConfig);

    client.on('error', (err) => {
      logger.error(err, 'Redis connection error');
    });

    client.on('connect', () => {
      logger.info('Redis connected succesfully');
    });
  }
  return client;
}

