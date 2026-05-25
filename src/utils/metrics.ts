/**
 * Enterprise Metric Registry
 * In a real environment, this connects to Prometheus / Datadog StatsD.
 */
import { logger } from './logger';

class MetricsClient {
  private counters: Map<string, number> = new Map();
  private timers: Map<string, number[]> = new Map();

  increment(name: string, tags?: Record<string, string>, value = 1) {
    const key = this.getKey(name, tags);
    const current = this.counters.get(key) || 0;
    this.counters.set(key, current + value);
    
    // Fire & forget logging in serverless environment
    if (process.env.NODE_ENV !== 'production') {
      logger.debug(`[Metric] count ${key} +${value}`);
    }
  }

  timing(name: string, valueMs: number, tags?: Record<string, string>) {
    const key = this.getKey(name, tags);
    if (!this.timers.has(key)) {
      this.timers.set(key, []);
    }
    this.timers.get(key)!.push(valueMs);

    if (process.env.NODE_ENV !== 'production') {
      logger.debug(`[Metric] timing ${key} ${valueMs}ms`);
    }
  }

  private getKey(name: string, tags?: Record<string, string>): string {
    if (!tags) return name;
    const tagStr = Object.entries(tags).map(([k, v]) => `${k}:${v}`).join(',');
    return `${name}{${tagStr}}`;
  }
}

export const metrics = new MetricsClient();
