import { CircuitBreaker, BreakerState } from './CircuitBreaker';
import { SupplierHealthService } from './SupplierHealthService';
import { logger } from '../../lib/logger';

export class SupplierRouter {
  private breakers: Map<string, CircuitBreaker> = new Map();

  constructor(private supplierIds: string[]) {
    this.supplierIds.forEach(id => this.breakers.set(id, new CircuitBreaker(id)));
  }

  async getBestSupplier(): Promise<string | null> {
    let bestSupplier: string | null = null;
    let highestScore = -1;

    for (const id of this.supplierIds) {
      const breaker = this.breakers.get(id);
      if (await breaker?.getState() === BreakerState.OPEN) continue;

      const score = await SupplierHealthService.getSupplierScore(id);
      if (score > highestScore) {
        highestScore = score;
        bestSupplier = id;
      }
    }
    
    logger.info({ bestSupplier, highestScore }, 'Supplier routing decision made');
    return bestSupplier;
  }
}
