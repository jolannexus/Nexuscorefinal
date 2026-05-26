/**
 * Enterprise Metric Registry
 * In a real environment, this connects to Prometheus / Datadog StatsD.
 */
import { register, transactionCounter, transactionDuration, webhookCounter, reconciliationDrift, settlementAnomalyCounter } from '../lib/metrics';
import { logger } from '../lib/logger';

class MetricsClient {
  increment(name: string, tags?: Record<string, string>, value = 1) {
    try {
      if (name.includes('drift')) {
         reconciliationDrift.labels(tags?.tenant || 'unknown', 'IDR').inc(value);
      } else if (name.includes('stuck_transaction') || name.includes('anomaly')) {
         settlementAnomalyCounter.labels(tags?.tenant || 'unknown', name).inc(value);
      } else if (name.includes('transaction')) {
         transactionCounter.labels(tags?.tenant || 'unknown', tags?.status || 'unknown', tags?.supplier || 'unknown').inc(value);
      } else if (name.includes('webhook')) {
         webhookCounter.labels(tags?.provider || 'unknown', tags?.status || 'unknown').inc(value);
      }
    } catch (e: any) {
      logger.error(e, `Failed to proxy metric: ${name}`);
    }
  }

  timing(name: string, valueMs: number, tags?: Record<string, string>) {
    try {
      if (name.includes('transaction.latency')) {
         transactionDuration.labels(tags?.tenant || 'unknown', tags?.supplier || 'unknown').observe(valueMs / 1000);
      }
    } catch (e: any) {
      logger.error(e, `Failed to proxy metric timing: ${name}`);
    }
  }
}

export const metrics = new MetricsClient();
