import { SupplierFactory } from './supplierFactory';
import { SupplierStatus, SupplierResponse, SupplierOrderResult } from './types';
import { Order, Product, SupplierConnection } from '../../types';
import { ProviderSelector } from './providerSelector';
import { prisma } from '../../lib/prisma';

export class OrderProcessor {
  /**
   * Attempts to fulfill an order using the optimal scored supplier connection.
   * If primary fails, automatically falls back to other scored active connections.
   */
  static async processOrder(params: {
    order: Order;
    product: Product;
    primaryConnection: SupplierConnection;
    fallbackConnection?: SupplierConnection;
    connections?: SupplierConnection[]; // optional pre-loaded candidate list
    agencyId?: string;
  }): Promise<SupplierResponse<SupplierOrderResult>> {
    const agencyId = params.agencyId || params.order.agencyId || params.primaryConnection.agencyId;
    console.log(`[OrderProcessor] Initializing orchestration for order ${params.order.id} (Product: ${params.product.name})`);

    // 1. Gather all potential supplier connection candidates
    let candidates: SupplierConnection[] = params.connections || [];

    if (candidates.length === 0) {
      // Build candidate array from explicit properties passed
      const explicitConnections = [params.primaryConnection, params.fallbackConnection].filter(
        (c): c is SupplierConnection => !!c
      );
      
      candidates = [...explicitConnections];

      // Try dynamic lazy discovery of all configure active connections in agency
      if (agencyId) {
        try {
          const activeSuppliers = await prisma.supplier.findMany({
            where: {
              tenantId: agencyId,
              status: 'ACTIVE'
            }
          });
          const discovered: SupplierConnection[] = [];
          
          activeSuppliers.forEach(docSnap => {
            const creds = typeof docSnap.credentials === 'string' ? JSON.parse(docSnap.credentials) : docSnap.credentials;
            discovered.push({
              id: docSnap.id,
              supplierName: docSnap.name,
              agencyId: docSnap.tenantId,
              status: docSnap.status as any,
              apiKey: creds.apiKey,
              secretKey: creds.secretKey,
              resellerId: creds.resellerId,
              lastSyncAt: new Date(),
              createdAt: docSnap.createdAt
            });
          });

          if (discovered.length > 0) {
            // Merge in discovered connections avoiding duplicates based on provider name
            discovered.forEach(disc => {
              if (!candidates.some(c => c.supplierName.toUpperCase() === disc.supplierName.toUpperCase())) {
                candidates.push(disc);
              }
            });
          }
        } catch (discErr) {
          console.warn('[OrderProcessor] Active supplier discovery bypass/error:', discErr);
        }
      }
    }

    // Ensure we have at least one candidate connection to fall back to
    if (candidates.length === 0) {
      candidates = [params.primaryConnection];
    }

    // 2. Delegate to the automated, dynamic ProviderSelector failover engine
    const selector = ProviderSelector.getInstance();
    const result = await selector.executeWithFailover(
      agencyId,
      candidates,
      params.product,
      params.order,
      async (connection) => {
        return this.executeOrder(connection, params.product, params.order);
      }
    );

    return result;
  }

  private static async executeOrder(connection: SupplierConnection, product: Product, order: Order): Promise<SupplierResponse<SupplierOrderResult>> {
    try {
      const adapter = SupplierFactory.getAdapter(connection.supplierName, {
        apiKey: connection.apiKey,
        secretKey: connection.secretKey,
        username: (connection as any).username || connection.accessToken, // backward compatibility
        resellerId: connection.resellerId
      });

      const response = await adapter.createOrder({
        productCode: product.productCode,
        target: order.targetUrl || '',
        quantity: order.quantity || 1,
        amount: order.totalCost || 0,
        orderId: order.id
      });

      return response;
    } catch (err: any) {
      console.error(`[OrderProcessor] Execution error on ${connection.supplierName}:`, err.message);
      return { success: false, error: err.message || 'Unknown Supplier Error' };
    }
  }
}

