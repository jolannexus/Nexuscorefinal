import { getRedisClient } from '../../lib/redis';
import { prisma } from '../../lib/prisma';
import { logger } from '../../lib/logger';

const TENANT_CACHE_TTL = 3600; // 1 hour

export class TenantCacheService {
  /**
   * Retrieves a tenant by custom domain, utilizing Redis caching.
   */
  static async getTenantByDomain(domain: string) {
    const redis = getRedisClient();
    const cacheKey = `tenant:domain:${domain}`;

    if (redis.status === 'ready') {
      try {
        const cached = await redis.get(cacheKey);
        if (cached) {
          return JSON.parse(cached);
        }
      } catch (err: any) {
        logger.warn(`Redis cache read disabled/error for ${cacheKey}`);
      }
    }

    const tenant = await prisma.tenant.findUnique({
      where: { customDomain: domain }
    }).catch(() => null);

    if (tenant && redis.status === 'ready') {
      try {
        await redis.setex(cacheKey, TENANT_CACHE_TTL, JSON.stringify(tenant));
      } catch (err: any) {
        logger.warn(`Redis cache write disabled/error for ${cacheKey}`);
      }
    }

    return tenant;
  }

  /**
   * Retrieves a tenant by slug, utilizing Redis caching.
   */
  static async getTenantBySlug(slug: string) {
    const redis = getRedisClient();
    const cacheKey = `tenant:slug:${slug}`;

    if (redis.status === 'ready') {
      try {
        const cached = await redis.get(cacheKey);
        if (cached) {
          return JSON.parse(cached);
        }
      } catch (err: any) {
        logger.warn(`Redis cache read disabled/error for ${cacheKey}`);
      }
    }

    const tenant = await prisma.tenant.findUnique({
      where: { slug }
    }).catch(() => null);

    if (tenant && redis.status === 'ready') {
      try {
        await redis.setex(cacheKey, TENANT_CACHE_TTL, JSON.stringify(tenant));
      } catch (err: any) {
        logger.warn(`Redis cache write disabled/error for ${cacheKey}`);
      }
    }

    return tenant;
  }

  /**
   * Invalidates tenant cache logic.
   */
  static async invalidateTenant(tenant: any) {
    if (!tenant) return;
    const redis = getRedisClient();
    const keys = [];
    if (tenant.customDomain) keys.push(`tenant:domain:${tenant.customDomain}`);
    if (tenant.slug) keys.push(`tenant:slug:${tenant.slug}`);
    
    if (keys.length > 0 && redis.status === 'ready') {
      try {
         await redis.del(...keys);
      } catch (err: any) {
         logger.warn(`Failed to invalidate tenant cache for ${tenant.id}`);
      }
    }
  }
}
