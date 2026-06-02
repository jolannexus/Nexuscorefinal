import { prisma } from '../../lib/prisma';
import { LedgerService } from './ledgerService';
import { Prisma } from '@prisma/client';
import { FraudDetectionService, TransactionContext } from '../../domain/fraud/FraudDetectionService';

export interface OrderCreationResult {
  success: boolean;
  orderId?: string;
  error?: string;
  isDuplicate?: boolean;
}

import { eventDispatcher } from '../../events/EventDispatcher';
import { DomainEvent } from '../../events/types';
import { financialLogger } from '../../lib/logger';

export class TransactionManagerService {
  /**
   * Safe, atomical, PostgreSQL-first ACID order placement with Row-Locking and balance preservation.
   */
  static async createOrder(params: {
    resellerId: string;
    agencyId: string;
    productId: string;
    quantity: number;
    targetAccount: string;
    idempotencyKey?: string;
    fraudContext?: TransactionContext;
  }): Promise<OrderCreationResult> {
    try {
      // 0. Fraud Check
      if (params.fraudContext) {
        const isSafe = await FraudDetectionService.isTransactionSafe(params.fraudContext);
        if (!isSafe) {
          throw new Error('FRAUD_SCORE_TOO_HIGH');
        }
      }

      return await prisma.$transaction(async (tx) => {
        // 1. Check for optional client/API-level idempotency to prevent duplicate submissions
        if (params.idempotencyKey) {
          const existingTx = await tx.transaction.findUnique({
            where: { idempotencyIn: params.idempotencyKey }
          });
          if (existingTx) {
            financialLogger.warn(`[TX_MANAGER] Detected idempotent order submission for token: ${params.idempotencyKey}`);
            return {
              success: true,
              orderId: existingTx.id,
              isDuplicate: true
            };
          }
        }

        // 2. Fetch product inside the txn
        const product = await tx.product.findUnique({
          where: { id: params.productId }
        });

        if (!product) {
          throw new Error('PRODUCT_NOT_FOUND');
        }

        if (!product.isAvailable) {
          throw new Error('PRODUCT_UNAVAILABLE');
        }

        const unitPrice = Number(product.sellPrice);
        const costPrice = Number(product.costPrice);
        const totalAmount = unitPrice * params.quantity;
        const totalCost = costPrice * params.quantity;
        const profitAmount = totalAmount - totalCost;

        // 3. Create the main transaction/order record first (status PENDING)
        const order = await tx.transaction.create({
          data: {
            tenantId: params.agencyId,
            customerTarget: params.targetAccount,
            status: 'PENDING',
            totalAmount: new Prisma.Decimal(totalAmount),
            profitAmount: new Prisma.Decimal(profitAmount),
            idempotencyIn: params.idempotencyKey || `order-idemp-${Date.now()}-${Math.random()}`,
            items: {
              create: {
                productId: params.productId,
                quantity: params.quantity,
                priceUnit: new Prisma.Decimal(unitPrice)
              }
            }
          }
        });

        // 4. Freeze/debit the amount instantly with a row-locked Ledger entry.
        // LedgerService handles all FOR UPDATE locks atomically.
        const ledgerResult = await LedgerService.executeLedgerEntry({
          resellerId: params.resellerId,
          agencyId: params.agencyId,
          amount: totalAmount,
          type: 'FREEZE',
          description: `Order Freeze: SKU ${product.sku} x ${params.quantity}`,
          orderId: order.id,
          referenceId: params.idempotencyKey ? `freeze-${params.idempotencyKey}` : undefined,
          existingTransaction: tx
        });

        if (!ledgerResult.success) {
          throw new Error('BALANCE_FREEZE_FAILED');
        }

        return {
          success: true,
          orderId: order.id,
          isDuplicate: false
        };
      }, {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        timeout: 10000
      });
    } catch (err: any) {
      financialLogger.error({ error: err.message }, `[TX_MANAGER] Transactional order creation aborted or rolled back.`);
      return {
        success: false,
        error: err.message || 'TRANSACTION_ROLLBACK'
      };
    }
  }

  /**
   * Settle and complete final delivery confirmation. Resolves frozen reserves into absolute debit.
   */
  static async completeOrder(orderId: string, resellerId: string, agencyId: string): Promise<boolean> {
    try {
      const payload = await prisma.$transaction(async (tx) => {
        // Lock the order for update to prevent concurrent race conditions
        const lockedOrders = await tx.$queryRaw<any[]>(
          Prisma.sql`SELECT * FROM "Transaction" WHERE id = ${orderId} FOR UPDATE`
        );
        const order = lockedOrders[0];

        if (!order || !(order.status === 'PENDING' || order.status === 'PROCESSING')) {
          financialLogger.warn(`[TX_MANAGER] Process violation: Order ${orderId} missing or not in processable state.`);
          throw new Error('ORDER_NOT_PROCESSABLE');
        }

        const amount = Number(order.totalAmount);

        // Execute Confirm Debit (releases Frozen, registers actual Debit snapshot)
        const ledgerRes = await LedgerService.executeLedgerEntry({
          resellerId,
          agencyId,
          amount,
          type: 'CONFIRM_DEBIT',
          description: `Settle Order Delivery: ID ${orderId}`,
          orderId,
          existingTransaction: tx
        });

        if (!ledgerRes.success) {
          throw new Error('SETTLEMENT_DEBIT_FAILED');
        }

        // Resolve status to SUCCESS
        await tx.transaction.update({
          where: { id: orderId },
          data: { status: 'SUCCESS' }
        });

        // Award optional sales commissions dynamically
        await this.distributeCommissions(orderId, resellerId, agencyId, tx);

        return { orderId, amount, resellerId, agencyId }; // Return payload for event
      });

      if (!payload) return false;

      // Emit outside of the SQL transaction block
      eventDispatcher.dispatch(DomainEvent.ORDER_SETTLED, {
        orderId: payload.orderId,
        tenantId: payload.agencyId,
        resellerId: payload.resellerId,
        profitAmount: 0, // Placeholder
        timestamp: new Date().toISOString()
      });

      return true;
    } catch (err: any) {
      financialLogger.error({ error: err.message }, `[TX_MANAGER] Fails to complete and settle order ${orderId}:`);
      return false;
    }
  }

  /**
   * Safe fail-safe path representing rollback protection. Unfreezes reserved funds and resets balances.
   */
  static async failAndRefundOrder(orderId: string, resellerId: string, agencyId: string, reason: string): Promise<boolean> {
    try {
      const payload = await prisma.$transaction(async (tx) => {
        // Lock the order for update to prevent concurrent race conditions
        const lockedOrders = await tx.$queryRaw<any[]>(
          Prisma.sql`SELECT * FROM "Transaction" WHERE id = ${orderId} FOR UPDATE`
        );
        const order = lockedOrders[0];

        if (!order) {
           financialLogger.warn(`[TX_MANAGER] Processing error: Order ${orderId} not found.`);
           return false;
        }

        if (order.status === 'FAILED' || order.status === 'REFUNDED') {
           financialLogger.warn(`[TX_MANAGER] Processing error: Order ${orderId} already rolled back.`);
           return false;
        }

        const amount = Number(order.totalAmount);

        if (order.status === 'PENDING' || order.status === 'PROCESSING') {
           // Reversal execution: UNFREEZE reserved balance
           const ledgerRes = await LedgerService.executeLedgerEntry({
             resellerId,
             agencyId,
             amount,
             type: 'UNFREEZE',
             description: `Failure Rollback: ${reason} (Order: ${orderId})`,
             orderId,
             existingTransaction: tx
           });

           if (!ledgerRes.success) throw new Error('ROLLBACK_REVERSION_FAILED');
        } else if (order.status === 'SUCCESS') {
           // Post-settlement webhook failure: Real CREDIT Refund
           const ledgerRes = await LedgerService.executeLedgerEntry({
             resellerId,
             agencyId,
             amount,
             type: 'CREDIT',
             description: `Supplier Webhook Failure Refund: ${reason} (Order: ${orderId})`,
             orderId,
             existingTransaction: tx
           });

           if (!ledgerRes.success) throw new Error('WEBHOOK_REFUND_CREDIT_FAILED');
        }

        // Resolve status to FAILED
        await tx.transaction.update({
          where: { id: orderId },
          data: { status: 'FAILED' }
        });

        return { orderId, agencyId, resellerId, reason, isRefund: order.status === 'SUCCESS' };
      });

      if (!payload) return false;
      
      eventDispatcher.dispatch(DomainEvent.SUPPLIER_FAILED, {
        orderId: payload.orderId,
        tenantId: payload.agencyId,
        supplierName: 'UNKNOWN', // Track provider later
        reason: payload.reason,
        timestamp: new Date().toISOString()
      });

      if (payload.isRefund) {
        eventDispatcher.dispatch(DomainEvent.REFUND_ISSUED, {
          orderId: payload.orderId,
          tenantId: payload.agencyId,
          timestamp: new Date().toISOString()
        });
      }

      return true;
    } catch (err: any) {
      financialLogger.error({ error: err.message }, `[TX_MANAGER] Failed to rollback/refund order ${orderId}:`);
      return false;
    }
  }

  /**
   * Distributes commissions to agency partners hierarchy securely.
   */
  private static async distributeCommissions(
    orderId: string,
    resellerId: string,
    agencyId: string,
    tx: Prisma.TransactionClient
  ) {
    try {
      // Fetch dynamic reseller parent relations down the reseller_tree in SQL database schema
      const links = await tx.resellerTree.findMany({
        where: {
          childId: resellerId,
          tenantId: agencyId
        },
        orderBy: {
          level: 'asc'
        }
      });

      if (!links || links.length === 0) return;

      const order = await tx.transaction.findUnique({ where: { id: orderId } });
      if (!order) return;

      const totalProfit = Number(order.profitAmount);
      if (totalProfit <= 0) return;

      // Distribute nominal commission rate (e.g., 5% to reseller parent level 1, 2% etc.)
      for (const link of links) {
        const rate = link.level === 1 ? 0.05 : 0.02; // Configurable tier
        const commissionAmount = totalProfit * rate;

        if (commissionAmount > 0) {
          // Record commission record in SQL database
          const comm = await tx.commission.create({
            data: {
              tenantId: agencyId,
              transactionId: orderId,
              resellerId: link.parentId,
              amount: new Prisma.Decimal(commissionAmount),
              isSettled: false
            }
          });

          // Fund the parent reseller's balance directly
          await LedgerService.executeLedgerEntry({
            resellerId: link.parentId,
            agencyId,
            amount: commissionAmount,
            type: 'CREDIT',
            description: `Tier Commission from Reseller: Team order ID ${orderId}`,
            orderId,
            referenceId: `comm-${comm.id}`,
            existingTransaction: tx
          });

          // Mark settled
          await tx.commission.update({
            where: { id: comm.id },
            data: { isSettled: true }
          });
        }
      }
    } catch (commErr) {
      financialLogger.error({ error: commErr }, '[COMMISSION_DISTRIBUTION_WARNING] Commissions failed to settle:');
      // We don't bubble commission failures to block main user order settlement
    }
  }
}
