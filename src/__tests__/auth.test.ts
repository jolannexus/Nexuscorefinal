import { describe, it, expect, vi } from 'vitest';
import { generateToken, verifyToken } from '../middleware/auth';
import bcrypt from 'bcrypt';

describe('Auth Middleware & Crypto', () => {
  describe('JWT Token utilities', () => {
    it('generateToken() should yield a string with 3 parts (header.body.signature)', () => {
      const payload = { uid: 'u123', email: 'test@test.com', role: 'USER' };
      const token = generateToken(payload);
      expect(typeof token).toBe('string');
      const parts = token.split('.');
      expect(parts.length).toBe(3);
    });

    it('verifyToken() should return correct payload for valid token', () => {
      const payload = { uid: 'u123', email: 'test@test.com', role: 'USER', tenantId: 't1' };
      const token = generateToken(payload);
      const decoded = verifyToken(token);
      expect(decoded).not.toBeNull();
      expect(decoded.uid).toBe('u123');
      expect(decoded.email).toBe('test@test.com');
      expect(decoded.role).toBe('USER');
      expect(decoded.tenantId).toBe('t1');
      expect(decoded.exp).toBeDefined();
    });

    it('verifyToken() should return null for manipulated token', () => {
      const payload = { uid: 'u123', email: 'test@test.com', role: 'USER' };
      const token = generateToken(payload);
      
      const parts = token.split('.');
      const manipulatedToken = `${parts[0]}.${parts[1]}manipulated.${parts[2]}`;
      
      const decoded = verifyToken(manipulatedToken);
      expect(decoded).toBeNull();
    });

    it('verifyToken() should return null for expired token', () => {
      // Mock Date.now() to simulate time travel
      vi.useFakeTimers();
      
      const payload = { uid: 'u123', email: 'test@test.com', role: 'USER' };
      const token = generateToken(payload);
      
      // Advance time by 25 hours (token expires in 24 hours)
      vi.advanceTimersByTime(25 * 60 * 60 * 1000);
      
      const decoded = verifyToken(token);
      expect(decoded).toBeNull();
      
      vi.useRealTimers();
    });
  });

  describe('bcrypt operations', () => {
    it('hash() should yield different string from plaintext', async () => {
      const password = 'mySecretPassword123!';
      const hash = await bcrypt.hash(password, 10);
      expect(hash).not.toEqual(password);
      expect(hash.length).toBeGreaterThan(0);
    });

    it('compare() should return true for correct password', async () => {
      const password = 'mySecretPassword123!';
      const hash = await bcrypt.hash(password, 10);
      const isValid = await bcrypt.compare(password, hash);
      expect(isValid).toBe(true);
    });

    it('compare() should return false for incorrect password', async () => {
      const password = 'mySecretPassword123!';
      const hash = await bcrypt.hash(password, 10);
      const isValid = await bcrypt.compare('wrongPassword', hash);
      expect(isValid).toBe(false);
    });
  });
});
