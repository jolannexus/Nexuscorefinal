import { prisma } from '../../lib/prisma';
import { getRedisClient } from '../../lib/redis';
import { logger } from '../../lib/logger';
import { PaymentProviderAdapter } from './PaymentProviderAdapter';
import { MidtransAdapter } from './adapters/MidtransAdapter';
import { XenditAdapter } from './adapters/XenditAdapter';
import { DuitkuAdapter } from './adapters/DuitkuAdapter';
import { CircuitBreaker, BreakerState } from '../orchestration/CircuitBreaker';

export class PaymentGatewayManager {
  private static instance: PaymentGatewayManager;
  private adapters: Map<'midtrans' | 'xendit' | 'duitku', PaymentProviderAdapter> = new Map();
  private breakers: Map<string, CircuitBreaker> = new Map();

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
    const name = adapter.getName();
    this.adapters.set(name, adapter);
    this.breakers.set(name, new CircuitBreaker(`pg_${name}`, { failureThreshold: 5, recoveryTimeout: 60000 }));
  }

  public async executeWithBreaker<T>(providerName: 'midtrans' | 'xendit' | 'duitku', action: () => Promise<T>): Promise<T> {
    const breaker = this.breakers.get(providerName);
    if (!breaker) throw new Error(`Breaker for ${providerName} not found`);
    return breaker.execute(action);
  }

  /**
   * Evaluates and routes to the best provider based on health score or tenant manual preference
   */
  public async getBestAdapter(tenantId: string, preferredProvider?: 'midtrans' | 'xendit' | 'duitku'): Promise<PaymentProviderAdapter> {
    // 1. If tenant has a manual preference and it's healthy, we use it
    if (preferredProvider) {
      const adapter = this.adapters.get(preferredProvider);
      const breaker = this.breakers.get(preferredProvider);
      if (adapter && breaker && await breaker.getState() === BreakerState.CLOSED) {
        const score = await adapter.getHealthScore(tenantId);
        if (score >= 50) {
          return adapter;
        }
        logger.warn({ tenantId, preferredProvider, score }, 'Preferred payment gateway has low health score. Seeking failover.');
      }
    }

    // 2. Otherwise routing table: select provider with highest health score and CLOSED breaker
    let bestAdapter: PaymentProviderAdapter | null = null;
    let highestScore = -1;

    for (const adapter of this.adapters.values()) {
      const name = adapter.getName();
      const breaker = this.breakers.get(name);
      
      if (breaker && await breaker.getState() === BreakerState.OPEN) {
         continue; // Skip open breakers
      }

      const score = await adapter.getHealthScore(tenantId);
      logger.debug({ provider: name, score, tenantId }, 'Checking health score for routing');
      if (score > highestScore) {
        highestScore = score;
        bestAdapter = adapter;
      }
    }

    if (!bestAdapter) {
      // absolute safe fallback if all breakers are struggling
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
