import { DiscountCode } from '../../types';

const DISCOUNTS_KEY = 'nexus_marketing_discounts';

const getStoredDiscounts = (): DiscountCode[] => {
  try {
    const raw = localStorage.getItem(DISCOUNTS_KEY);
    return raw ? JSON.parse(raw) : [
      {
        id: "disc_welcome",
        code: "NEXUS20",
        type: "PERCENTAGE",
        value: 20,
        status: "ACTIVE",
        usageCount: 0,
        usageLimit: 100,
        minPurchase: 10000,
        createdAt: new Date().toISOString()
      }
    ];
  } catch {
    return [];
  }
};

const saveStoredDiscounts = (discounts: DiscountCode[]) => {
  try {
    localStorage.setItem(DISCOUNTS_KEY, JSON.stringify(discounts));
  } catch {}
};

export const discountService = {
  /**
   * Loads marketing campaigns and discounts locally.
   */
  async getDiscounts(agencyId: string): Promise<DiscountCode[]> {
    return getStoredDiscounts();
  },

  /**
   * Persists a new discount code configuration.
   */
  async createDiscount(agencyId: string, data: Partial<DiscountCode>): Promise<void> {
    const discounts = getStoredDiscounts();
    const newDisc: DiscountCode = {
      id: "disc_" + Date.now(),
      code: (data.code || '').toUpperCase(),
      type: data.type || 'PERCENTAGE',
      value: data.value || 0,
      minPurchase: data.minPurchase || 0,
      usageLimit: data.usageLimit || 999,
      usageCount: 0,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      ...data
    };
    discounts.unshift(newDisc);
    saveStoredDiscounts(discounts);
  },

  /**
   * Modifies existing discount campaigns.
   */
  async updateDiscount(agencyId: string, discountId: string, data: Partial<DiscountCode>): Promise<void> {
    const discounts = getStoredDiscounts();
    const updated = discounts.map(d => {
      if (d.id === discountId) {
        return {
          ...d,
          ...data,
          updatedAt: new Date().toISOString()
        };
      }
      return d;
    });
    saveStoredDiscounts(updated);
  },

  /**
   * Deactivates or removes discount values.
   */
  async deleteDiscount(agencyId: string, discountId: string): Promise<void> {
    const discounts = getStoredDiscounts().filter(d => d.id !== discountId);
    saveStoredDiscounts(discounts);
  },

  /**
   * Validates promotional voucher codes against transaction parameters.
   */
  async validateCode(agencyId: string, code: string, orderAmount: number): Promise<DiscountCode | null> {
    const discounts = getStoredDiscounts();
    const discount = discounts.find(d => d.code === code.toUpperCase() && d.status === 'ACTIVE');
    if (!discount) return null;

    if (discount.usageLimit && discount.usageCount >= discount.usageLimit) {
      return null;
    }

    if (orderAmount < (discount.minPurchase || 0)) {
      throw new Error(`Minimum purchase of IDR ${discount.minPurchase.toLocaleString()} required`);
    }

    return discount;
  },

  /**
   * Increments promotion usage counters.
   */
  async incrementUsage(agencyId: string, discountId: string): Promise<void> {
    const discounts = getStoredDiscounts();
    const updated = discounts.map(d => {
      if (d.id === discountId) {
        return {
          ...d,
          usageCount: (d.usageCount || 0) + 1
        };
      }
      return d;
    });
    saveStoredDiscounts(updated);
  }
};
