import { prisma } from '../../lib/prisma';
import { getRedisClient } from '../../lib/redis';
import { logger } from '../../lib/logger';
import { PaymentProviderAdapter } from './PaymentProviderAdapter';
import { MidtransAdapter } from './adapters/MidtransAdapter';
import { XenditAdapter } from './adapters/XenditAdapter';
import { DuitkuAdapter } from './adapters/DuitkuAdapter';

export class PaymentGatewayManager {
  private static instance: PaymentGatewayManager;
  private adapters: Map<'midtrans' | 'xendit' | 'duitku', PaymentProviderAdapter> = new Map();

  private constructor() {
    this.registerAdapter(new MidtransAdapter());
    this.registerAdapter(new XenditAdapter());
    this.registerAdapter(new DuitkuAdapter());
  }

  public static getInstance(): PaymentGatewayManager {
    if (!PaymentGatewayManager.instance) {
      PaymentGatewayManager.instance = new PaymentGatewayManager();
    }
    return PaymentGatewayManager.instance;
  }

  private registerAdapter(adapter: PaymentProviderAdapter) {
    this.adapters.set(adapter.getName(), adapter);
  }

  /**
   * Evaluates and routes to the best provider based on health score or tenant manual preference
   */
  public async getBestAdapter(tenantId: string, preferredProvider?: 'midtrans' | 'xendit' | 'duitku'): Promise<PaymentProviderAdapter> {
    // 1. If tenant has a manual preference and it's healthy, we use it
    if (preferredProvider) {
      const adapter = this.adapters.get(preferredProvider);
      if (adapter) {
        const score = await adapter.getHealthScore(tenantId);
        if (score >= 50) {
          return adapter;
        }
        logger.warn({ tenantId, preferredProvider, score }, 'Preferred payment gateway has low health score. Seeking failover.');
      }
    }

    // 2. Otherwise routing table: select provider with highest health score
    let bestAdapter: PaymentProviderAdapter | null = null;
    let highestScore = -1;

    for (const adapter of this.adapters.values()) {
      const score = await adapter.getHealthScore(tenantId);
      logger.debug({ provider: adapter.getName(), score, tenantId }, 'Checking health score for routing');
      if (score > highestScore) {
        highestScore = score;
        bestAdapter = adapter;
      }
    }

    if (!bestAdapter) {
      // absolute safe fallback
      bestAdapter = this.adapters.get('xendit') || this.adapters.get('midtrans')!;
    }

    logger.info({ tenantId, selectedProvider: bestAdapter.getName(), healthScore: highestScore }, 'Dynamic gateway routing selected provider');
    return bestAdapter;
  }

  /**
   * Tracks standard failures to fuel the routing/failover dynamic engine
   */
  public async recordFailure(tenantId: string, provider: 'midtrans' | 'xendit' | 'duitku') {
    try {
      const redis = getRedisClient();
      const key = `gateway_health:${tenantId}:${provider}:errors`;
      await redis.incr(key);
      await redis.expire(key, 300); // 5-minute sliding window for failover evaluation
      logger.warn({ tenantId, provider }, `Recorded payment gateway failure for ${provider}. Updated health scores.`);
    } catch (err) {
      logger.error(err, 'Failed to record gateway failure in Redis');
    }
  }

  public getAdapter(name: 'midtrans' | 'xendit' | 'duitku'): PaymentProviderAdapter {
    const adapter = this.adapters.get(name);
    if (!adapter) {
      throw new Error(`Payment adapter ${name} is not registered`);
    }
    return adapter;
  }
}
