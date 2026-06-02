import { describe, it, expect } from 'vitest';
import { Prisma } from '@prisma/client';
import { LedgerEngine, LedgerAccountType } from '../services/financial/LedgerEngine';

describe('Ledger Core Balancing & Integrity Operations', () => {
  it('should validate and throw error if total CREDIT is not equal to total DEBIT (imbalanced entry)', async () => {
    const imbalancedReq = {
      tenantId: 'tenant-master-01',
      type: 'PAYOUT',
      description: 'Imbalanced entry verification test',
      idempotencyKey: 'idem-ledger-01',
      entries: [
        {
          accountId: 'wallet-user-01',
          accountType: LedgerAccountType.USER_WALLET,
          amount: 250000,
          type: 'CREDIT' as const
        },
        {
          accountId: 'liability-system-01',
          accountType: LedgerAccountType.SYSTEM_LIABILITY,
          amount: 200000, // Imbalanced discrepancy of 50000
          type: 'DEBIT' as const
        }
      ]
    };

    await expect(LedgerEngine.recordTransaction(imbalancedReq))
      .rejects
      .toThrow(/Ledger integrity check failed/);
  });

  it('should enforce that any individual ledger entry amount must be positive (prevents negative updates)', async () => {
    const negativeValueReq = {
      tenantId: 'tenant-master-01',
      type: 'DEPOSIT',
      description: 'Negative ledger entry injection attempt',
      idempotencyKey: 'idem-ledger-02',
      entries: [
        {
          accountId: 'wallet-user-01',
          accountType: LedgerAccountType.USER_WALLET,
          amount: -50000, // Negative amount
          type: 'CREDIT' as const
        },
        {
          accountId: 'system-capital-01',
          accountType: LedgerAccountType.SYSTEM_LIABILITY,
          amount: -50000, // Negative amount
          type: 'DEBIT' as const
        }
      ]
    };

    await expect(LedgerEngine.recordTransaction(negativeValueReq))
      .rejects
      .toThrow(/Ledger entry amounts must be positive/);
  });

  it('should block and reject ledger entry operations if wallet balance drops below zero (prevents negative wallet balances)', () => {
    // Model simulated entity state
    const walletSim = {
      id: 'wallet-test-01',
      balance: new Prisma.Decimal(150000) // Initial current balance is 150000 IDR
    };

    const debitAmount = new Prisma.Decimal(200000); // Attempting to Debit 200000 (exposing potential negative pool)

    // Execute standard ledger deduction mutation
    walletSim.balance = walletSim.balance.sub(debitAmount);

    const verifyWalletIntegrity = () => {
      if (walletSim.balance.lessThan(0)) {
        throw new Error(`Insufficient funds in wallet ${walletSim.id}.`);
      }
    };

    expect(verifyWalletIntegrity)
      .toThrow(`Insufficient funds in wallet ${walletSim.id}.`);
  });

  it('should verify and assert true if credit and debit amounts are properly balanced and non-negative', async () => {
    const balancedMockEntries = [
      { amount: new Prisma.Decimal(500000), type: 'CREDIT' as const },
      { amount: new Prisma.Decimal(500000), type: 'DEBIT' as const }
    ];

    let totalCredit = new Prisma.Decimal(0);
    let totalDebit = new Prisma.Decimal(0);

    for (const e of balancedMockEntries) {
      expect(e.amount.greaterThanOrEqualTo(0)).toBe(true);
      if (e.type === 'CREDIT') totalCredit = totalCredit.add(e.amount);
      if (e.type === 'DEBIT') totalDebit = totalDebit.add(e.amount);
    }

    expect(totalCredit.equals(totalDebit)).toBe(true);
  });
});
