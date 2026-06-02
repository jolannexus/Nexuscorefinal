import { prisma } from '../../lib/prisma';
import { Prisma } from '@prisma/client';
import { financialLogger } from '../../lib/logger';

export class LedgerService {
  /**
   * Primary transactional ledger engine powered by PostgreSQL row locking 'FOR UPDATE' and Prisma Client transactions.
   */
  static async executeLedgerEntry(params: {
    resellerId: string;
    agencyId: string;
    amount: number;
    type: string; // 'CREDIT' | 'DEBIT' | 'FREEZE' | 'UNFREEZE' | 'CONFIRM_DEBIT' | 'REFUND' | 'PURCHASE' | 'DEPOSIT'
    description: string;
    orderId?: string;
    referenceId?: string; // Idempotency reference key
    metadata?: Record<string, any>;
    existingTransaction?: Prisma.TransactionClient;
  }) {
    const executeLogic = async (tx: Prisma.TransactionClient) => {
      // 1. Transactional Idempotency Check
      if (params.referenceId) {
        const existingLedger = await tx.walletLedger.findUnique({
          where: { idempotencyKey: params.referenceId }
        });
        if (existingLedger) {
          financialLogger.warn(`[LEDGER] Idempotent hit for token: ${params.referenceId}. Skipping double charge.`);
          return {
            success: true,
            transactionId: existingLedger.id,
            balanceAfter: Number(existingLedger.balanceAfter),
            isDuplicate: true
          };
        }
      }

      // 2. Query multi-tenant user representation or ensure reseller profile exists in SQL
      // In a strict foreign-key SQL model, we should verify the tenant and user account exist.
      // We will lazily bootstrap a user and tenant context if they don't exist yet to protect migration flows.
      let tenant = await tx.tenant.findUnique({ where: { id: params.agencyId } });
      if (!tenant) {
        tenant = await tx.tenant.create({
          data: {
            id: params.agencyId,
            name: 'NexusCore Tenant',
            slug: `tenant-${params.agencyId.substring(0, 8)}`,
            status: 'ACTIVE'
          }
        });
      }

      let user = await tx.user.findUnique({ where: { email: `${params.resellerId}@nexuscore.net` } });
      if (!user) {
        // Find existing user by ID if not search by email
        const userById = await tx.user.findUnique({ where: { id: params.resellerId } });
        if (userById) {
          user = userById;
        } else {
          user = await tx.user.create({
            data: {
              id: params.resellerId,
              email: `${params.resellerId}@nexuscore.net`,
              passwordHash: 'PBKDF2_MIGRATED_BCRYPT_SECURE_PASSWORD',
              displayName: `Reseller ${params.resellerId.substring(0, 5)}`,
              role: 'RESELLER',
              tenantId: params.agencyId
            }
          });
        }
      }

      // 3. Row-lock current wallet representation 'FOR UPDATE'
      // Note: In Postgres with prisma, SQL raw query is the most resilient way to do row-locking (SELECT FOR UPDATE)
      let walletRows = await tx.$queryRaw<any[]>(
        Prisma.sql`SELECT * FROM "Wallet" WHERE "userId" = ${user.id} AND "tenantId" = ${tenant.id} FOR UPDATE`
      );

      let wallet = walletRows && walletRows.length > 0 ? walletRows[0] : null;

      if (!wallet) {
        // Create wallet if it doesn't exist
        const newWallet = await tx.wallet.create({
          data: {
            userId: user.id,
            tenantId: tenant.id,
            balance: new Prisma.Decimal(0.00),
            frozenBalance: new Prisma.Decimal(0.00),
            currency: 'IDR'
          }
        });

        // Acquire FOR UPDATE row lock immediately
        const lockedRows = await tx.$queryRaw<any[]>(
          Prisma.sql`SELECT * FROM "Wallet" WHERE "id" = ${newWallet.id} FOR UPDATE`
        );
        wallet = lockedRows[0];
      }

      const currentBalance = Number(wallet.balance || 0);
      const currentFrozen = Number(wallet.frozenBalance || 0);

      let nextBalance = currentBalance;
      let nextFrozen = currentFrozen;

      // 4. Implement clear finite calculations for balance states
      switch (params.type) {
        case 'DEBIT':
        case 'PURCHASE':
          if (currentBalance < params.amount) throw new Error('Insufficient Funds');
          nextBalance = currentBalance - params.amount;
          break;

        case 'CONFIRM_DEBIT':
          if (currentFrozen < params.amount) throw new Error('INSUFFICIENT_FROZEN_FUNDS');
          nextFrozen = currentFrozen - params.amount;
          break;

        case 'CREDIT':
        case 'DEPOSIT':
        case 'REFUND':
          nextBalance = currentBalance + params.amount;
          break;

        case 'FREEZE':
          if (currentBalance < params.amount) throw new Error('Insufficient Funds');
          nextBalance = currentBalance - params.amount;
          nextFrozen = currentFrozen + params.amount;
          break;

        case 'UNFREEZE':
          if (currentFrozen < params.amount) throw new Error('INSUFFICIENT_FROZEN_FUNDS');
          nextBalance = currentBalance + params.amount;
          nextFrozen = currentFrozen - params.amount;
          break;

        default:
          throw new Error(`Unsupported transaction type: ${params.type}`);
      }

      // 5. Update Wallet balance
      await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: new Prisma.Decimal(nextBalance),
          frozenBalance: new Prisma.Decimal(nextFrozen)
        }
      });

      // 6. Write Immutable audit-trail ledger log (WalletLedger - Legacy)
      const idempotencyKey = params.referenceId || `ledger-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
      const legacyLedgerEntry = await tx.walletLedger.create({
        data: {
          walletId: wallet.id,
          tenantId: tenant.id,
          amount: new Prisma.Decimal(Math.abs(params.amount)),
          type: params.type,
          balanceBefore: new Prisma.Decimal(currentBalance),
          balanceAfter: new Prisma.Decimal(nextBalance),
          description: params.description,
          idempotencyKey,
          orderId: params.orderId || null
        }
      });

      // 7. Write Double-Entry Accounting Ledger (Immutable Infrastructure)
      const absAmount = Math.abs(params.amount);
      let accountDebited = '';
      let accountCredited = '';
      
      switch (params.type) {
        case 'DEBIT':
        case 'PURCHASE':
          accountDebited = 'SYSTEM:ASSET:RECEIVABLE'; // E.g., we get the money from their wallet
          accountCredited = wallet.id; // Liability decreases
          break;
        case 'CONFIRM_DEBIT':
          accountDebited = 'SYSTEM:REVENUE:PLATFORM'; // Revenue realized
          accountCredited = 'SYSTEM:LIABILITY:FROZEN'; // Frozen liability settles
          break;
        case 'CREDIT':
        case 'DEPOSIT':
        case 'REFUND':
          accountDebited = wallet.id; // Liability increases
          accountCredited = 'SYSTEM:ASSET:BANK'; // Asset bank increases
          break;
        case 'FREEZE':
          accountDebited = 'SYSTEM:LIABILITY:FROZEN'; // We owe them frozen now
          accountCredited = wallet.id; // We owe them less active balance
          break;
        case 'UNFREEZE':
          accountDebited = wallet.id; // We owe them active balance again
          accountCredited = 'SYSTEM:LIABILITY:FROZEN'; // We owe less frozen
          break;
        default:
          accountDebited = 'SYSTEM:UNKNOWN';
          accountCredited = 'SYSTEM:UNKNOWN';
      }

      await tx.ledgerJournal.create({
        data: {
          tenantId: tenant.id,
          type: params.type,
          description: params.description,
          orderId: params.orderId || null,
          idempotencyKey: `journal-${idempotencyKey}`,
          entries: {
            create: [
              {
                accountId: accountDebited,
                tenantId: tenant.id,
                type: 'DEBIT',
                amount: new Prisma.Decimal(absAmount)
              },
              {
                accountId: accountCredited,
                tenantId: tenant.id,
                type: 'CREDIT',
                amount: new Prisma.Decimal(absAmount)
              }
            ]
          }
        }
      });

      return {
        success: true,
        transactionId: legacyLedgerEntry.id,
        balanceAfter: nextBalance,
        isDuplicate: false
      };
    };

    if (params.existingTransaction) {
      return await executeLogic(params.existingTransaction);
    } else {
      return await prisma.$transaction(async (tx) => {
        return await executeLogic(tx);
      }, {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        timeout: 10000 // 10 seconds timeout for reliability
      });
    }
  }
}
