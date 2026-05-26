import rateLimit from 'express-rate-limit';
import { getRedisClient } from '../lib/redis';
import RedisStore from 'rate-limit-redis';
import { logger } from '../lib/logger';

export const createRateLimiter = (prefix: string, maxRequests: number, windowSeconds: number) => {
  let store: any = undefined;
  
  if (process.env.REDIS_URL && !process.env.REDIS_URL.includes("localhost") && !process.env.REDIS_URL.includes("127.0.0.1")) {
    try {
       store = new RedisStore({
        sendCommand: async (...args: string[]) => {
          const client = getRedisClient();
          return (client.call as any)(...args);
        },
        prefix: `ratelimit:${prefix}:`,
      });
    } catch (err) {
       logger.warn('Failed to initialize RedisStore for rate limiting, falling back to memory store.');
    }
  }

  return rateLimit({
    store,
    windowMs: windowSeconds * 1000,
    max: maxRequests,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' },
    validate: { xForwardedForHeader: false },
  });
};

export const globalApiLimiter = createRateLimiter('global_api', 1000, 60); // 1000 requests per minute
export const authLimiter = createRateLimiter('auth', 10, 60); // 10 login attempts per minute
export const webhookLimiter = createRateLimiter('webhook', 500, 60); // 500 webhook hits per minute
