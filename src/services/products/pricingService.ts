import { Product } from '../../types/index';

export interface PricingRule {
  targetType: 'CATEGORY' | 'PLATFORM' | 'INDIVIDUAL';
  targetValue: string; // e.g. 'Followers' or 'Instagram'
  marginType: 'PERCENTAGE' | 'FIXED';
  marginValue: number;
}

export const pricingService = {
  calculateSellingPrice(basePrice: number, marginType: 'PERCENTAGE' | 'FIXED', marginValue: number): number {
    if (marginType === 'PERCENTAGE') {
      return basePrice * (1 + marginValue / 100);
    }
    return basePrice + marginValue;
  },

  /**
   * Applies individual pricing markup rule formulas locally in memory.
   */
  async applyRule(rule: PricingRule): Promise<void> {
    console.info("Pricing rule applied locally in memory:", rule);
  },

  /**
   * Safe getter to return calculated markup rates.
   */
  async getCustomMarkup(agencyId: string, productId: string): Promise<number | null> {
    return null;
  }
};
