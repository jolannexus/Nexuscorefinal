import { describe, it, expect } from 'vitest';

export function calculateFinalPrice(
  baseCost: number,
  agencyMarginPercent: number,
  resellerDiscountPercent: number,
  fixedFees: number
): number {
  return (
    baseCost *
    (1 + agencyMarginPercent / 100) *
    (1 - resellerDiscountPercent / 100) +
    fixedFees
  );
}

export function validateAmount(amount: number): boolean {
  if (amount <= 0) {
    throw new Error('Amount must be a positive number');
  }
  return true;
}

export function deductBalance(balance: number, deduction: number): number {
  if (balance < deduction) {
    throw new Error('Balance cannot be negative');
  }
  return balance - deduction;
}

export function checkDoubleEntry(entries: { type: 'DEBIT' | 'CREDIT'; amount: number }[]): boolean {
  const totalDebit = entries
    .filter((e) => e.type === 'DEBIT')
    .reduce((sum, e) => sum + e.amount, 0);
  const totalCredit = entries
    .filter((e) => e.type === 'CREDIT')
    .reduce((sum, e) => sum + e.amount, 0);

  return totalDebit === totalCredit;
}

describe('Ledger Business Logic', () => {
  describe('Balance Deduction', () => {
    it('should throw an error if deduction is greater than balance', () => {
      expect(() => deductBalance(100, 150)).toThrowError('Balance cannot be negative');
    });

    it('should return the correct remaining balance', () => {
      expect(deductBalance(200, 150)).toBe(50);
    });
  });

  describe('Double-Entry Check', () => {
    it('should return true if total DEBIT equals total CREDIT', () => {
      const entries = [
        { type: 'DEBIT' as const, amount: 100 },
        { type: 'CREDIT' as const, amount: 70 },
        { type: 'CREDIT' as const, amount: 30 },
      ];
      expect(checkDoubleEntry(entries)).toBe(true);
    });

    it('should return false if total DEBIT does not equal total CREDIT', () => {
      const entries = [
        { type: 'DEBIT' as const, amount: 100 },
        { type: 'CREDIT' as const, amount: 90 },
      ];
      expect(checkDoubleEntry(entries)).toBe(false);
    });
  });

  describe('Amount Validation', () => {
    it('should throw error for negative amounts', () => {
      expect(() => validateAmount(-50)).toThrowError('Amount must be a positive number');
    });

    it('should throw error for zero amount', () => {
      expect(() => validateAmount(0)).toThrowError('Amount must be a positive number');
    });

    it('should return true for positive amounts', () => {
      expect(validateAmount(100)).toBe(true);
    });
  });

  describe('Price Calculation Formula', () => {
    it('should correctly calculate the final price based on the formula', () => {
      // Formula: Base 1000 * (1 + 10%) * (1 - 5%) + 500 = 1000 * 1.1 * 0.95 + 500 = 1100 * 0.95 + 500 = 1045 + 500 = 1545
      const baseCost = 1000;
      const agencyMargin = 10;
      const resellerDiscount = 5;
      const fixedFees = 500;

      const finalPrice = calculateFinalPrice(baseCost, agencyMargin, resellerDiscount, fixedFees);
      expect(finalPrice).toBe(1545);
    });
  });
});
