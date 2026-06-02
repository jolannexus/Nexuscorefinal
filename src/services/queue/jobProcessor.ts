import { OrderProcessor } from '../suppliers/orderProcessor';
import { SupplierStatus } from '../suppliers/types';
import { LedgerService } from '../billing/ledgerService';
import { Order, Product, SupplierConnection } from '../../types';
import { prisma } from '../../lib/prisma';
import { logger } from '../../lib/logger';
import { TransactionManagerService } from '../billing/transactionManagerService';

export interface TopupJobPayload {
  orderId: string;
  agencyId: string;
}

export class TopupJobProcessor {
  /**
   * Central job processing engine.
   * Resolves order, looks up connections, routes transaction, performs ledger accounting,
   * handles failed jobs, retries, and records audits.
   */
  public static async process(payload: TopupJobPayload): Promise<void> {
    const { orderId, agencyId } = payload;
    logger.info(`[TopupJobProcessor] [Worker] Processing Order: ${orderId} for Agency: ${agencyId}`);

    // 1. Get Order Document via Prisma
    const orderRecord = await prisma.transaction.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: { product: true }
        },
        walletLedgers: true
      }
    });

    if (!orderRecord) {
      throw new Error(`Order ${orderId} not found`);
    }

    if (orderRecord.status !== 'PENDING' && orderRecord.status !== 'PROCESSING') {
      logger.info(`[TopupJobProcessor] Aborting. Order ${orderId} is in status ${orderRecord.status}`);
      return;
    }

    // 2. Fetch Associated Product Document via Prisma
    const firstItem = orderRecord.items[0];
    if (!firstItem || !firstItem.product) {
      await prisma.transaction.update({
        where: { id: orderId },
        data: { status: 'FAILED' }
      });
      throw new Error(`Product missing for order ${orderId}`);
    }

    const productRecord = firstItem.product;

    const order: Order = {
      id: orderRecord.id,
      resellerId: orderRecord.walletLedgers[0]?.walletId || '', // Not ideal but fallback
      agencyId: agencyId,
      productId: firstItem.productId,
      status: orderRecord.status as any,
      quantity: firstItem.quantity,
      totalCost: Number(orderRecord.totalAmount),
      targetUrl: orderRecord.customerTarget,
    };

    // Fix resellerId looking at walletLedger
    const ledgerEntry = await prisma.walletLedger.findFirst({
      where: { orderId: orderId, type: 'FREEZE' },
      include: { wallet: true }
    });
    
    if (ledgerEntry && ledgerEntry.wallet.userId) {
      order.resellerId = ledgerEntry.wallet.userId;
    }

    const product: Product = {
      id: productRecord.id,
      name: productRecord.name,
      productCode: (productRecord.metadata as any)?.productCode || productRecord.sku,
      category: productRecord.category,
      basePrice: Number(productRecord.costPrice),
      sellingPrice: Number(productRecord.sellPrice),
      isEnabled: productRecord.isAvailable,
      status: productRecord.isAvailable ? 'ACTIVE' : 'DISABLED',
      supplierName: (productRecord.metadata as any)?.supplierName,
      agencyId,
      supplierId: (productRecord.metadata as any)?.supplierId || 'unknown',
      appName: (productRecord.metadata as any)?.appName || 'unknown',
      syncedAt: new Date()
    };

    // 3. Look up active provider connections via Prisma
    const activeSuppliers = await prisma.supplier.findMany({
      where: {
        tenantId: agencyId,
        status: 'ACTIVE'
      }
    });

    if (activeSuppliers.length === 0) {
      await TransactionManagerService.failAndRefundOrder(orderId, order.resellerId!, agencyId, 'No active supplier connection configured');
      logger.error(`[TopupJobProcessor] Order ${orderId} failed: No active supplier connection. Job aborted cleanly.`);
      return;
    }

    const connections: SupplierConnection[] = activeSuppliers.map(s => {
      const creds = typeof s.credentials === 'string' ? JSON.parse(s.credentials) : s.credentials;
      return {
        id: s.id,
        supplierName: s.name,
        agencyId: s.tenantId,
        status: s.status as any,
        apiKey: creds.apiKey,
        secretKey: creds.secretKey,
        resellerId: creds.resellerId,
        lastSyncAt: new Date(),
        createdAt: s.createdAt
      };
    });

    const primaryConnection = connections[0];

    // 4. Fire fulfilling execution on OrderProcessor
    const response = await OrderProcessor.processOrder({
      order,
      product,
      primaryConnection,
      connections,
      agencyId,
    });

    if (response.success && response.data) {
      const result = response.data;

      // Finish order through the transaction manager to prevent partial completions
      const settlementSuccess = await TransactionManagerService.completeOrder(orderId, order.resellerId!, agencyId);

      if (settlementSuccess) {
         // Optionally update with external supplier ID if needed
         await prisma.transaction.update({
           where: { id: orderId },
           data: {
              updatedAt: new Date()
           }
         });
         logger.info(`[TopupJobProcessor] Fulfillment complete for order ${orderId}`);
      } else {
        throw new Error(`Settlement failed for order ${orderId} - Potential concurrency hit`);
      }

    } else {
      logger.warn(`[TopupJobProcessor] Fulfillment error for order ${orderId}: ${response.error}`);
      throw new Error(`Supplier fulfillment failed: ${response.error}`);
    }
  }
}
