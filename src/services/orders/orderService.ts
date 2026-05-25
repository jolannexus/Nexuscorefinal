import { Order, Product, SupplierConnection } from '../../types/index';

export const orderService = {
  /**
   * Fetches the orders list securely from PostgreSQL/Prisma API
   */
  async getOrders(agencyId: string): Promise<Order[]> {
    try {
      const response = await fetch('/api/orders', {
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error("Failed to fetch orders");
      return await response.json();
    } catch (error) {
      console.error('[SQL_ORDERS] Error retrieving orders from API:', error);
      return [];
    }
  },

  /**
   * FinTech-grade transactional order placement utilizing SQL Row-locks and Ledger guarantees via API.
   */
  async placeOrder(
    resellerId: string, 
    productId: string, 
    quantity: number, 
    targetAccount: string,
    supplierConnection: SupplierConnection
  ): Promise<string> {
    const agencyId = supplierConnection.agencyId;
    
    // Delegate to PostgreSQL Transaction Coordinator via API
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: {
         'Content-Type': 'application/json',
         'x-idempotency-key': `place-order-${resellerId}-${productId}-${Date.now()}`
      },
      body: JSON.stringify({ resellerId, agencyId, productId, quantity, targetAccount })
    });

    const result = await response.json();

    if (!response.ok || !result.success || !result.orderId) {
      throw new Error(result.error || 'FAILED_TO_PLACE_TRANSACTION_ORDER');
    }

    // Trigger high-availability background execution API asynchronously for fast UI response
    try {
      fetch('/api/orders/process', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ orderId: result.orderId, agencyId })
      }).catch(e => console.error("[Fulfillment Trigger Warning] Async fetch call failed:", e));
    } catch (apiErr) {
      console.warn('[Fulfillment Trigger Bypassed]', apiErr);
    }

    return result.orderId;
  },

  /**
   * Execute manual/restful triggers for processing the fulfillment pipeline.
   */
  async processOrder(agencyId: string, orderId: string): Promise<void> {
    try {
      const response = await fetch('/api/orders/process', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ orderId, agencyId })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Execution engine returned failure');
      }
    } catch (error: any) {
      console.error(`[OrderService] Manual processing pipeline trigger failed:`, error);
      throw error;
    }
  }
};
export default orderService;
