import { Response, NextFunction } from 'express';
import { getRedisClient } from '../lib/redis';
import { logger } from '../lib/logger';
import { AuthenticatedRequest } from './auth';

export const idempotencyMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  // Only apply idempotency to mutating HTTP actions (POST, PUT, DELETE)
  if (!['POST', 'PUT', 'DELETE'].includes(req.method)) {
    return next();
  }

  const idempotencyKey =
    req.headers['x-idempotency-key'] || req.headers['idempotency-key'];

  if (!idempotencyKey || typeof idempotencyKey !== 'string') {
    return next();
  }

  const tenantId = req.agency?.id || 'nexuscore-default-tenant';
  const redisKey = `idempotency:${tenantId}:${idempotencyKey}:${req.originalUrl || req.url}`;

  let redis;
  try {
    redis = getRedisClient();
  } catch (err) {
    logger.warn('Redis client not available, continuing without idempotency cache.');
    return next();
  }

  try {
    // 1. Check for existing record
    const record = await redis.get(redisKey);

    if (record) {
      if (record === 'IN_PROGRESS') {
        logger.warn(
          { tenantId, idempotencyKey, path: req.originalUrl },
          'Idempotent request conflict: same operation is already in progress'
        );
        return res.status(409).json({
          error: 'Conflict: A request with the same idempotency key is already in progress. Please retry.',
        });
      }

      // Replay cached response
      const cached = JSON.parse(record);
      logger.info(
        { tenantId, idempotencyKey, path: req.originalUrl, cachedStatus: cached.status },
        'Idempotency HIT: replaying cached response'
      );

      res.set(cached.headers);
      res.set('X-Cache-Lookup', 'HIT (idempotency)');
      return res.status(cached.status).send(cached.body);
    }

    // 2. Lock the key to IN_PROGRESS (acting as a distributed lock with short TTL)
    await redis.set(redisKey, 'IN_PROGRESS', 'EX', 60);

    // 3. Override res.send / res.json to capture the response and cache it
    const originalSend = res.send;
    let finished = false;

    res.send = function (body: any): any {
      if (finished) return originalSend.apply(res, arguments as any);
      finished = true;

      // Only cache successful or client-side responses (status < 500)
      if (res.statusCode < 500) {
        const responseHeaders = res.getHeaders();
        // Exclude transient or trace headers
        delete responseHeaders['connection'];
        delete responseHeaders['keep-alive'];

        redis.set(
          redisKey,
          JSON.stringify({
            status: res.statusCode,
            body: typeof body === 'string' ? body : JSON.stringify(body),
            headers: responseHeaders,
          }),
          'EX',
          86400 // 24-hour retention
        ).catch((err) => {
          logger.error(err, 'Failed to save idempotency response to Redis');
        });
      } else {
        // If it resulted in a server error, clear the lock so client can try again
        redis.del(redisKey).catch((err) => {
          logger.error(err, 'Failed to clear in-progress lock for failed request');
        });
      }

      return originalSend.apply(res, arguments as any);
    };

    // Clean up in case of client disconnect/abort
    res.on('close', () => {
      if (!finished) {
        redis.del(redisKey).catch(() => {});
      }
    });

    next();
  } catch (err: any) {
    logger.error({ err, path: req.originalUrl }, 'Idempotency middleware encountered handling exception');
    next();
  }
};
