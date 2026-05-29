import { prisma } from '../../lib/prisma';
import { getRedisClient } from '../../lib/redis';
import { logger } from '../../lib/logger';

export class CatalogCacheService {
  private static CACHE_TTL = 300; // 5 minutes in seconds

  private static getCacheKey(tenantId: string): string {
    return `catalog:public:${tenantId}`;
  }

  /**
   * Get public products catalog for a tenant. Checks Redis cache first, falls back to Prisma, then caches.
   */
  public static async getPublicProducts(tenantId: string): Promise<any[]> {
    const key = this.getCacheKey(tenantId);
    
    try {
      const redis = getRedisClient();
      const cached = await redis.get(key);
      
      if (cached) {
        logger.info({ tenantId }, '[CatalogCache] Cache HIT for public products list');
        return JSON.parse(cached);
      }
    } catch (cacheErr) {
      logger.warn({ cacheErr, tenantId }, '[CatalogCache] Redis fetch failed, falling back to database query');
    }

    // Cache miss or Redis failure -> query Postgres
    logger.info({ tenantId }, '[CatalogCache] Cache MISS for public products list. Querying database.');
    const products = await prisma.product.findMany({
      where: { tenantId, isAvailable: true }
    });

    // Save to cache asynchronously to avoid blocking the main thread
    if (products.length > 0) {
      try {
        const redis = getRedisClient();
        await redis.set(key, JSON.stringify(products), 'EX', this.CACHE_TTL);
        logger.info({ tenantId }, '[CatalogCache] Successfully warmed public products cache');
      } catch (cacheErr) {
        logger.error({ cacheErr, tenantId }, '[CatalogCache] Failed to warm public products cache');
      }
    }

    return products;
  }

  /**
   * Invalidates public products catalog cache for a tenant.
   * Call this whenever products are created, updated, toggled, or synced.
   */
  public static async invalidateCatalog(tenantId: string): Promise<void> {
    const key = this.getCacheKey(tenantId);
    try {
      const redis = getRedisClient();
      await redis.del(key);
      logger.info({ tenantId }, '[CatalogCache] Successfully invalidated public products cache');
    } catch (cacheErr) {
      logger.error({ cacheErr, tenantId }, '[CatalogCache] Failed to invalidate public products cache');
    }
  }
}
