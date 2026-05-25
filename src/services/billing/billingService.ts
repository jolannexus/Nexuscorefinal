import { prisma } from '../../lib/prisma';
import { LedgerService } from './ledgerService';
import { Transaction } from '../../types';
import { Prisma } from '@prisma/client';

export class BillingService {

  static async getPendingDeposits(agencyId: string): Promise<Transaction[]> {
    const deposits = await prisma.deposit.findMany({
      where: {
        status: 'PENDING',
        wallet: {
          tenantId: agencyId
        }
      },
      include: {
        wallet: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return deposits.map(d => ({
      id: d.id,
      resellerId: d.wallet.userId,
      agencyId: d.wallet.tenantId,
      amount: Number(d.amount),
      type: 'CREDIT',
      status: 'PENDING',
      description: `Deposit via ${d.paymentMethod}`,
      paymentMethod: d.paymentMethod,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt
    } as Transaction));
  }

  static async approveDeposit(tx: Transaction) {
    if (!tx.agencyId) throw new Error('Missing agencyId in transaction');

    return await prisma.$transaction(async (prismaTx) => {
      // 1. Audit and increase actual Balance via PostgreSQL-locked Ledger
      await LedgerService.executeLedgerEntry({
        resellerId: tx.resellerId,
        agencyId: tx.agencyId,
        amount: tx.amount,
        type: 'CREDIT',
        description: `Approved Deposit: ${tx.description || 'Deposit Request'}`,
        metadata: { originalTxId: tx.id },
        existingTransaction: prismaTx
      });

      // 2. Resolve/Update Deposit status in PostgreSQL database
      await prismaTx.deposit.update({
        where: { id: tx.id },
        data: {
          status: 'SUCCESS',
          updatedAt: new Date()
        }
      });
    }, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable
    });
  }

  static async rejectDeposit(agencyId: string, id: string) {
    return await prisma.$transaction(async (prismaTx) => {
      await prismaTx.deposit.update({
        where: { id },
        data: {
          status: 'EXPIRED',
          updatedAt: new Date()
        }
      });
    });
  }

  static async requestDeposit(params: {
    resellerId: string;
    agencyId: string;
    amount: number;
    paymentMethod: string;
  }) {
    return await prisma.$transaction(async (prismaTx) => {
      // Ensure user & tenant exist
      let user = await prismaTx.user.findFirst({
        where: {
          id: params.resellerId,
          tenantId: params.agencyId
        }
      });

      if (!user) {
        // Fallback or lazy create user in PostgreSQL
        user = await prismaTx.user.upsert({
          where: { email: `${params.resellerId}@nexuscore.net` },
          update: {},
          create: {
            id: params.resellerId,
            email: `${params.resellerId}@nexuscore.net`,
            passwordHash: 'PBKDF2_SECURE_PASSWORD',
            displayName: `Reseller ${params.resellerId.substring(0, 5)}`,
            role: 'RESELLER',
            tenantId: params.agencyId
          }
        });
      }

      // Ensure wallet exists
      let wallet = await prismaTx.wallet.findUnique({
        where: {
          userId_tenantId: {
            userId: user.id,
            tenantId: params.agencyId
          }
        }
      });

      if (!wallet) {
        wallet = await prismaTx.wallet.create({
          data: {
            userId: user.id,
            tenantId: params.agencyId,
            balance: new Prisma.Decimal(0),
            frozenBalance: new Prisma.Decimal(0),
            currency: 'IDR'
          }
        });
      }

      // Create PENDING Deposit record
      await prismaTx.deposit.create({
        data: {
          walletId: wallet.id,
          amount: new Prisma.Decimal(params.amount),
          status: 'PENDING',
          paymentMethod: params.paymentMethod,
          paymentRef: `DEP-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`
        }
      });

      return true;
    });
  }

  static async debitReseller(params: {
    resellerId: string;
    amount: number;
    description: string;
    agencyId: string;
    orderId?: string;
    existingTransaction?: Prisma.TransactionClient;
  }) {
    return await LedgerService.executeLedgerEntry({
      ...params,
      type: 'DEBIT'
    });
  }

  static async creditReseller(params: {
    resellerId: string;
    amount: number;
    description: string;
    agencyId: string;
    orderId?: string;
    existingTransaction?: Prisma.TransactionClient;
  }) {
    return await LedgerService.executeLedgerEntry({
      ...params,
      type: 'CREDIT'
    });
  }
}
