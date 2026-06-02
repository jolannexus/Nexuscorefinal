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

export const globalApiLimiter = createRateLimiter('global_api', 1000, 60);
export const authLimiter = createRateLimiter('auth', 10, 60);
export const webhookLimiter = createRateLimiter('webhook', 500, 60);

// Strict limiter khusus untuk login (anti brute-force)
export const loginStrictLimiter = createRateLimiter('login_strict', 20, 3600); // 20x per jam

// Limiter dengan custom handler untuk logging
export const authRouteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn({ ip: req.ip, path: req.path }, '[SECURITY] Rate limit reached on auth route');
    res.status(429).json({ error: 'Terlalu banyak percobaan. Coba lagi dalam 15 menit.' });
  },
  skipSuccessfulRequests: true,
});
