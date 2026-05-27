import { getRedisClient } from '../../lib/redis';
import { logger } from '../../lib/logger';

export enum BreakerState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN',
}

interface BreakerOptions {
  failureThreshold: number;
  recoveryTimeout: number; // ms
}

export class CircuitBreaker {
  private name: string;
  private options: BreakerOptions;

  constructor(name: string, options: BreakerOptions = { failureThreshold: 5, recoveryTimeout: 30000 }) {
    this.name = `cb:${name}`;
    this.options = options;
  }

  async getState(): Promise<BreakerState> {
    const state = await getRedisClient().get(`${this.name}:state`);
    return (state as BreakerState) || BreakerState.CLOSED;
  }

  async recordFailure() {
    const failures = await getRedisClient().incr(`${this.name}:failures`);
    if (failures >= this.options.failureThreshold) {
      await getRedisClient().set(`${this.name}:state`, BreakerState.OPEN, 'PX', this.options.recoveryTimeout);
      logger.warn(`Circuit breaker ${this.name} tripped to OPEN`);
    }
  }

  async recordSuccess() {
    await getRedisClient().del(`${this.name}:failures`);
    await getRedisClient().set(`${this.name}:state`, BreakerState.CLOSED);
  }

  async execute<T>(action: () => Promise<T>): Promise<T> {
    const state = await this.getState();
    
    if (state === BreakerState.OPEN) {
      throw new Error(`CircuitBreaker ${this.name} is OPEN - Fast failing`);
    }
    
    try {
      const result = await action();
      await this.recordSuccess();
      return result;
    } catch (error) {
      await this.recordFailure();
      throw error;
    }
  }
}
