import { PrismaClient } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

export class PricingEngine {
  /**
   * Calculates the final selling price for a given transaction item
   * based on tenant, sku, and the reseller's tier/level.
   * Priority: SKU specific rule -> Category specific rule -> Global rule -> Default margin fallback.
   */
  static async calculateFinalPrice(
    tenantId: string,
    sku: string,
    baseCost: number | Decimal,
    agreedResellerLevelId?: string
  ): Promise<number> {
    const cost = typeof baseCost === 'number' ? baseCost : baseCost.toNumber();

    // 1. Fetch the exact product info to get its category
    const product = await prisma.product.findFirst({
      where: { tenantId, sku }
    });

    // Fetch all active rules for this tenant (could be cached)
    const activeRules = await prisma.pricingRule.findMany({
      where: {
        tenantId,
        OR: [
          { resellerLevelId: agreedResellerLevelId }, 
          { resellerLevelId: null }
        ]
      }
    });

    // 2. Select the most specific rule available
    const appliedRule = this.selectMostSpecificRule(activeRules, sku, product?.category);

    if (!appliedRule) {
      // Fallback if no rules exist: returning 5% default margin as a safety net
      return cost * 1.05; 
    }

    // 3. Compute Value
    const markupValue = appliedRule.markupValue.toNumber();
    if (appliedRule.markupType === 'PERCENTAGE') {
      return cost * (1 + markupValue / 100);
    } else {
      // FIXED Markup (e.g. adding 200 IDR per transaction)
      return cost + markupValue;
    }
  }

  private static selectMostSpecificRule(rules: any[], sku: string, category?: string) {
    // Sort logic to prefer SKU > CATEGORY > GLOBAL
    // If tie, prefer rules that specifically target the resellerLevel vs Global Tier

    const getSpecificityScore = (rule: any) => {
      let score = 0;
      if (rule.type === 'SKU' && rule.targetRef === sku) score += 100;
      else if (rule.type === 'CATEGORY' && rule.targetRef === category) score += 50;
      else if (rule.type === 'GLOBAL') score += 10;
      
      // Bonus point if strictly bound to the user's specific tier
      if (rule.resellerLevelId) score += 5; 
      
      return score;
    };

    const scoredRules = rules
      .map(r => ({ rule: r, score: getSpecificityScore(r) }))
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score);

    return scoredRules.length > 0 ? scoredRules[0].rule : null;
  }
}
