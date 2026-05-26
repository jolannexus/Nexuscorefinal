import Redis from 'ioredis';
import { env } from './env';
import { logger } from './logger';

let client: Redis | null = null;

export function getRedisClient(): Redis {
  if (!client) {
    const redisConfig = {
      maxRetriesPerRequest: null,
      enableReadyCheck: false, // Prevent ready check from causing reconnect loops
      retryStrategy: (times: number) => {
        if (times > 5) return null; // Stop trying after 5 attempts
        return Math.min(times * 1000, 5000); // Exponential backoff between 1s and 5s
      }
    };

    client = new Redis(env.REDIS_URL, redisConfig);

    client.on('error', (err) => {
      logger.error(err, 'Redis connection error');
    });

    client.on('connect', () => {
      logger.info('Redis connected succesfully');
    });
  }
  return client;
}

