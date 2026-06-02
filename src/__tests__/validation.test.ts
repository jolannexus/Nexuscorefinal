import { describe, it, expect } from 'vitest';

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePassword(password: string): boolean {
  if (password.length < 8) return false;
  return /\d/.test(password);
}

export function validateAmountLogic(amount: number): boolean {
  return amount > 0;
}

export function validateResetToken(token: string): boolean {
  return /^[0-9a-fA-F]{64}$/.test(token);
}

describe('Validation Helpers', () => {
  describe('Email format', () => {
    it('should return true for valid email', () => {
      expect(validateEmail('user@domain.com')).toBe(true);
    });
    
    it('should return false for invalid email', () => {
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('user@.com')).toBe(false);
    });
  });

  describe('Password requirements', () => {
    it('should return true if password is at least 8 chars and contains a number', () => {
      expect(validatePassword('secret123')).toBe(true);
      expect(validatePassword('12345678')).toBe(true);
    });

    it('should return false if password is less than 8 characters', () => {
      expect(validatePassword('sec123')).toBe(false);
    });

    it('should return false if password has no numbers', () => {
      expect(validatePassword('passwordString')).toBe(false);
    });
  });

  describe('Transaction amount validation', () => {
    it('should return true for positive number', () => {
      expect(validateAmountLogic(100)).toBe(true);
      expect(validateAmountLogic(0.01)).toBe(true);
    });

    it('should return false for zero or negative number', () => {
      expect(validateAmountLogic(0)).toBe(false);
      expect(validateAmountLogic(-50)).toBe(false);
    });
  });

  describe('Reset password token validation', () => {
    it('should return true for exactly 64 hex characters', () => {
      const validToken = 'a'.repeat(64);
      expect(validateResetToken(validToken)).toBe(true);
    });

    it('should return false if not exactly 64 characters', () => {
      const invalidToken = 'a'.repeat(63);
      expect(validateResetToken(invalidToken)).toBe(false);
      
      const invalidToken2 = 'a'.repeat(65);
      expect(validateResetToken(invalidToken2)).toBe(false);
    });

    it('should return false if it contains non-hex characters', () => {
      const invalidToken = 'x'.repeat(64);
      expect(validateResetToken(invalidToken)).toBe(false);
    });
  });
});
