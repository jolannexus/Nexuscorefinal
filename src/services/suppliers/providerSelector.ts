import { SupplierConnection, Product, Order } from '../../types';
import { SupplierResponse, SupplierOrderResult } from './types';
import { prisma } from '../../lib/prisma';
import { supplierRegistry } from '../../adapters/suppliers/registry';
import { metrics } from '../../utils/metrics';
import { eventDispatcher } from '../../events/EventDispatcher';
import { DomainEvent } from '../../events/types';
import { logger } from '../../lib/logger';

export interface ProviderTelemetry {
  supplierName: string;
  agencyId: string;
  totalOrders: number;
  successfulOrders: number;
  failedOrders: number;
  successRate: number; // 0 to 1
  latencyHistory: number[]; // rolling history
  avgLatency: number;
  consecutiveFailures: number;
  cooldownUntil?: number; // millisecond timestamp
  lastError?: string;
  lastUpdatedAt?: any;
}

export interface ScoreBreakdown {
  baseScore: number;
  healthBonus: number;
  latencyScore: number;
  successRateScore: number;
  consecutiveFailurePenalty: number;
  cooldownPenalty: number;
  finalScore: number;
}

export interface NormalizedProviderSelection {
  connection: SupplierConnection;
  adapter: any; // ISupplierAdapter from '../../adapters/suppliers/ISupplierAdapter'
  score: number;
  breakdown: ScoreBreakdown;
  telemetry: ProviderTelemetry;
}

export class ProviderSelector {
  private static instance: ProviderSelector;
  
  // In-memory telemetry cache index key: `${agencyId}:${supplierName}`
  private telemetryStore: Map<string, ProviderTelemetry> = new Map();

  // In-memory quarantine cache: `${agencyId}:${supplierName.toUpperCase()}` -> expiration timestamp
  private quarantineStore: Map<string, number> = new Map();

  private constructor() {}

  public static getInstance(): ProviderSelector {
    if (!this.instance) {
      this.instance = new ProviderSelector();
    }
    return this.instance;
  }

  /**
   * Generates unique key for telemetry cache
   */
  private getCacheKey(agencyId: string, supplierName: string): string {
    return `${agencyId}:${supplierName.toUpperCase()}`;
  }

  /**
   * Returns telemetry for a provider, bootstrapping default clean metrics if uninitiated
   */
  public getOrCreateTelemetry(agencyId: string, supplierName: string): ProviderTelemetry {
    const key = this.getCacheKey(agencyId, supplierName);
    if (!this.telemetryStore.has(key)) {
      this.telemetryStore.set(key, {
        supplierName: supplierName.toUpperCase(),
        agencyId,
        totalOrders: 0,
        successfulOrders: 0,
        failedOrders: 0,
        successRate: 0.98, // Start with a strong baseline to prevent bootstrap cold penalty
        latencyHistory: [120, 150, 180], // Healthy baseline defaults
        avgLatency: 150,
        consecutiveFailures: 0
      });
    }
    return this.telemetryStore.get(key)!;
  }

  /**
   * Quarantines a provider temporarily to prevent it from being chosen
   */
  public quarantineProvider(agencyId: string, supplierName: string, durationMs: number = 5 * 60 * 1000): void {
    const key = this.getCacheKey(agencyId, supplierName);
    this.quarantineStore.set(key, Date.now() + durationMs);
    logger.warn(`[Quarantine] Provider ${supplierName.toUpperCase()} quarantined for ${durationMs / 1000}s`);
  }

  /**
   * Checks if a provider is currently quarantined
   */
  public isQuarantined(agencyId: string, supplierName: string): boolean {
    const key = this.getCacheKey(agencyId, supplierName);
    const expiresAt = this.quarantineStore.get(key);
    if (!expiresAt) return false;
    if (Date.now() > expiresAt) {
      this.quarantineStore.delete(key);
      return false;
    }
    return true;
  }

  /**
   * Clears quarantine for a provider manually if needed
   */
  public clearQuarantine(agencyId: string, supplierName: string): void {
    const key = this.getCacheKey(agencyId, supplierName);
    this.quarantineStore.delete(key);
  }

  /**
   * Evaluates and scores a provider connection
   */
  public calculateScore(
    connection: SupplierConnection,
    telemetry: ProviderTelemetry,
    product?: Product
  ): ScoreBreakdown {
    const baseScore = 100;
    let healthBonus = 0;
    let latencyScore = 0;
    let successRateScore = 0;
    let consecutiveFailurePenalty = 0;
    let cooldownPenalty = 0;

    // 1. Connection-level status check
    if (connection.status === 'INACTIVE') {
      cooldownPenalty -= 500; // Complete exclusion
    }

    // 2. Health check state valuation
    // Check if cooldown is active
    const now = Date.now();
    if (telemetry.cooldownUntil && telemetry.cooldownUntil > now) {
      cooldownPenalty -= 300; // Heavy penalty for cool down period
    }

    if (this.isQuarantined(connection.agencyId, connection.supplierName)) {
      cooldownPenalty -= 1000; // Under temporary quarantine, heavily penalize so that next healthiest provider is selected instead
    }

    // 3. Latency scoring evaluation
    const avgLatency = telemetry.avgLatency;
    if (avgLatency <= 180) {
      latencyScore = 15; // Fast provider bonus
    } else if (avgLatency <= 450) {
      latencyScore = 5;
    } else if (avgLatency <= 900) {
      latencyScore = -15; // Sluggish penalty
    } else {
      latencyScore = -40; // Timeout risk penalty
    }

    // 4. Success rate ratio valuation (adds up to 100 points)
    successRateScore = Math.round(telemetry.successRate * 100);

    // 5. Consecutive failure penalties
    if (telemetry.consecutiveFailures > 0) {
      consecutiveFailurePenalty = -(telemetry.consecutiveFailures * 30);
    }

    // 6. Product-level availability check
    if (product) {
      // If product status is known or has specific supplier mismatch
      if (product.supplierName && product.supplierName.toUpperCase() !== connection.supplierName.toUpperCase()) {
        cooldownPenalty -= 400; // Prefer connection matching explicit provider pinning
      }
    }

    const finalScore = baseScore + healthBonus + latencyScore + successRateScore + consecutiveFailurePenalty + cooldownPenalty;

    return {
      baseScore,
      healthBonus,
      latencyScore,
      successRateScore,
      consecutiveFailurePenalty,
      cooldownPenalty,
      finalScore
    };
  }

  /**
   * Sorts candidate connections descending based on their algorithmic score calculations
   */
  public selectBestProviders(
    connections: SupplierConnection[],
    product?: Product
  ): Array<{ connection: SupplierConnection; score: ScoreBreakdown }> {
    return connections
      .map(conn => {
        const telemetry = this.getOrCreateTelemetry(conn.agencyId, conn.supplierName);
        const score = this.calculateScore(conn, telemetry, product);
        return { connection: conn, score };
      })
      .sort((a, b) => b.score.finalScore - a.score.finalScore);
  }

  /**
   * Record transaction success telemetry metrics
   */
  public recordSuccess(supplierName: string, agencyId: string, latencyMs: number): void {
    const telemetry = this.getOrCreateTelemetry(agencyId, supplierName);
    
    telemetry.totalOrders += 1;
    telemetry.successfulOrders += 1;
    telemetry.consecutiveFailures = 0; // Reset consecutive flags
    telemetry.cooldownUntil = undefined;

    metrics.increment('supplier.order.success', { supplier: supplierName, tenant: agencyId });
    metrics.timing('supplier.latency', latencyMs, { supplier: supplierName, tenant: agencyId });
    telemetry.latencyHistory.push(latencyMs);
    if (telemetry.latencyHistory.length > 12) {
      telemetry.latencyHistory.shift();
    }

    // Calculate rolling average latency
    const sum = telemetry.latencyHistory.reduce((acc, curr) => acc + curr, 0);
    telemetry.avgLatency = Math.round(sum / telemetry.latencyHistory.length);

    // Recompute success rate
    telemetry.successRate = telemetry.successfulOrders / telemetry.totalOrders;
    telemetry.lastUpdatedAt = new Date();

    // Persist to relational database
    this.persistTelemetryToPostgres(telemetry);
  }

  /**
   * Record transaction failure telemetry and step-downs
   */
  public recordFailure(supplierName: string, agencyId: string, errorMsg?: string): void {
    const telemetry = this.getOrCreateTelemetry(agencyId, supplierName);

    telemetry.totalOrders += 1;
    telemetry.failedOrders += 1;
    telemetry.consecutiveFailures += 1;
    telemetry.lastError = errorMsg || 'Transaction fulfillment failed';
    telemetry.lastUpdatedAt = new Date();

    // Recompute success rate
    telemetry.successRate = telemetry.successfulOrders / telemetry.totalOrders;

    metrics.increment('supplier.order.failure', { supplier: supplierName, tenant: agencyId });

    // Trip circuit breaker if consecutive failures >= 3
    if (telemetry.consecutiveFailures >= 3) {
      // Impose cool down for 5 minutes
      telemetry.cooldownUntil = Date.now() + 5 * 60 * 1000;
      logger.warn({ supplier: supplierName, agencyId }, `[CircuitBreaker] Provider ${supplierName.toUpperCase()} tripped cooldown for 5m due to consecutive failures.`);
      metrics.increment('supplier.circuitbreaker.tripped', { supplier: supplierName });
    }

    // Persist to relational database
    this.persistTelemetryToPostgres(telemetry);
  }

  /**
   * Helper to resolve the correct adapter key from supplierName.
   */
  public resolveAdapterId(supplierName: string): string {
    const norm = supplierName.toLowerCase();
    if (norm.includes('digiflazz')) return 'digiflazz';
    if (norm.includes('vip') || norm.includes('reseller')) return 'vip-reseller';
    // Fall back to clean URL-safe format
    return norm.trim().replace(/\s+/g, '-');
  }

  /**
   * Main selection method to fetch the absolute optimal provider from SupplierRegistry
   * given a list of candidate connections and optional product.
   */
  public selectBestProvider(
    connections: SupplierConnection[],
    product?: Product
  ): NormalizedProviderSelection | null {
    if (!connections || connections.length === 0) {
      return null;
    }

    // Rank candidates using scoring algorithm
    const scoredRankedList = this.selectBestProviders(connections, product);

    // Find the highest ranked candidate that actually exists in our SupplierRegistry
    for (const item of scoredRankedList) {
      const adapterId = this.resolveAdapterId(item.connection.supplierName);
      const adapter = supplierRegistry.getAdapter(adapterId);
      
      // Ensure the adapter is registered in the registry
      if (adapter) {
        const telemetry = this.getOrCreateTelemetry(item.connection.agencyId, item.connection.supplierName);
        return {
          connection: item.connection,
          adapter,
          score: item.score.finalScore,
          breakdown: item.score,
          telemetry
        };
      }
    }

    return null;
  }

  /**
   * Orchestrates execution of a supplier order with automatic retry, failover,
   * dynamic next-healthiest provider re-evaluation, and quarantine handling.
   */
  public async executeWithFailover(
    agencyId: string,
    connections: SupplierConnection[],
    product: Product,
    order: Order,
    executor: (connection: SupplierConnection) => Promise<SupplierResponse<SupplierOrderResult>>
  ): Promise<SupplierResponse<SupplierOrderResult> & { failoverAttempts?: any[] }> {
    const attemptsLog: any[] = [];
    const triedSupplierNames = new Set<string>();

    let success = false;
    let finalResponse: SupplierResponse<SupplierOrderResult> = {
      success: false,
      error: 'No active scored connections found'
    };

    // Filter candidate connections that are active at basic level
    const activeCandidates = connections.filter(conn => conn.status !== 'INACTIVE');
    if (activeCandidates.length === 0) {
      return {
        success: false,
        error: 'No active supplier connections found for failover orchestration'
      };
    }

    while (activeCandidates.length > 0) {
      // 1. Select the absolute best/healthiest provider among the remaining non-tried candidates
      const remainingCandidates = activeCandidates.filter(c => !triedSupplierNames.has(c.supplierName.toUpperCase()));
      if (remainingCandidates.length === 0) {
        break; // No more candidates to try
      }

      // Calculate score and find the best
      const scoredList = this.selectBestProviders(remainingCandidates, product);
      if (scoredList.length === 0) {
        break;
      }
      
      const best = scoredList[0];
      const connection = best.connection;
      const supplierNameUpper = connection.supplierName.toUpperCase();
      triedSupplierNames.add(supplierNameUpper);

      logger.info(`[FailoverEngine] Selected provider ${connection.supplierName} with score ${best.score.finalScore}`);

      const startTime = Date.now();
      let result: SupplierResponse<SupplierOrderResult>;

      try {
        // 2. Execute fulfillment
        result = await executor(connection);
      } catch (err: any) {
        result = {
          success: false,
          error: err.message || 'Execution exception occurred'
        };
      }

      const duration = Date.now() - startTime;

      if (result.success && result.data) {
        // Success path
        this.recordSuccess(connection.supplierName, agencyId, duration);
        this.clearQuarantine(agencyId, connection.supplierName); // reset quarantine on success
        
        attemptsLog.push({
          supplierName: connection.supplierName,
          success: true,
          latency: duration,
          score: best.score.finalScore
        });

        // Log swap record in Postgres if we did failover (not the original highest scorer on the very first try)
        if (attemptsLog.length > 1) {
          try {
            await prisma.auditLog.create({
              data: {
                tenantId: agencyId,
                action: 'PROVIDER_FAILOVER',
                details: JSON.stringify({
                  orderId: order.id,
                  productName: product.name,
                  primarySupplier: attemptsLog[0].supplierName,
                  fallbackSupplier: connection.supplierName,
                  executionDelayMs: duration,
                  attempts: attemptsLog.length,
                  reason: 'Automatic Operational Failover',
                }),
                severity: 'INFO'
              }
            });
          } catch (logErr) {
            logger.error({ error: logErr }, '[ProviderSelector] Failed to log failover swap:');
          }
        }

        return {
          ...result,
          failoverAttempts: attemptsLog
        };
      } else {
        // 3. Failed provider detected
        const errorMsg = result.error || 'Provider rejected request';
        logger.warn(`[FailoverEngine] FAILED attempt with ${connection.supplierName}: ${errorMsg}`);

        // Register failure in metrics
        this.recordFailure(connection.supplierName, agencyId, errorMsg);

        // 4. Failed provider temporarily quarantined (duration: 3 minutes)
        this.quarantineProvider(agencyId, connection.supplierName, 3 * 60 * 1000);

        // Dispatch SUPPLIER_FAILED domain event in real-time
        try {
          eventDispatcher.dispatch(DomainEvent.SUPPLIER_FAILED, {
            orderId: order.id,
            tenantId: agencyId,
            supplierName: connection.supplierName,
            reason: errorMsg,
            timestamp: new Date().toISOString()
          });
        } catch (dispatchErr) {
          logger.error({ error: dispatchErr }, '[ProviderSelector] Failed to dispatch SUPPLIER_FAILED event:');
        }

        attemptsLog.push({
          supplierName: connection.supplierName,
          success: false,
          error: errorMsg,
          latency: duration,
          score: best.score.finalScore
        });

        finalResponse = result;
      }
    }

    // Return final accumulated failure response
    return {
      ...finalResponse,
      failoverAttempts: attemptsLog
    };
  }

  /**
   * Async fire-and-forget saving of provider stats metadata to Postgres
   */
  private async persistTelemetryToPostgres(telemetry: ProviderTelemetry): Promise<void> {
    try {
      const supplier = await prisma.supplier.findFirst({
        where: { tenantId: telemetry.agencyId, name: telemetry.supplierName }
      });
      if (supplier) {
        await prisma.supplier.update({
          where: { id: supplier.id },
          data: {
            successRate: telemetry.successRate,
            avgResponseTime: telemetry.avgLatency
          }
        });
      }
    } catch (err) {
      logger.error({ error: err }, '[ProviderSelector] Error syncing telemetry to Postgres:');
    }
  }
}
