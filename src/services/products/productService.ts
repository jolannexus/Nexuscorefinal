import { Product, SupplierConnection } from '../../types/index';
import { authService } from '../authService';

export const productService = {
  /**
   * Loads products database from PostgreSQL database.
   */
  async getProducts(agencyId: string, options: { includeStreaming?: boolean, includeGames?: boolean } = {}): Promise<Product[]> {
    try {
      const token = authService.getToken();
      const response = await fetch('/api/products', {
        headers: {
          'Authorization': 'Bearer ' + token
        }
      });
      if (response.ok) {
        return await response.json();
      }
      return [];
    } catch (error) {
      console.error('Failed to get products:', error);
      return [];
    }
  },

  /**
   * Toggles products availability settings.
   */
  async toggleProductStatus(agencyId: string, productId: string, isEnabled: boolean): Promise<void> {
    try {
      const token = authService.getToken();
      await fetch('/api/products/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({ productId, isEnabled })
      });
    } catch (error) {
      console.error('Failed to toggle product status:', error);
    }
  },

  /**
   * Synchronizes products catalogue from connected suppliers.
   */
  async syncProducts(connection: SupplierConnection): Promise<void> {
    try {
      const token = authService.getToken();
      const response = await fetch('/api/suppliers/sync-products', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({
          connectionId: connection.id,
          agencyId: connection.agencyId
        })
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || 'Server product catalog synchronization failed');
      }

      console.log('Sync completed successfully');
    } catch (error) {
      console.error('Product sync failed:', error);
      throw error;
    }
  },

  /**
   * Background task runner to trigger periodic catalog synchronizations.
   */
  startBackgroundPriceSync(connections: SupplierConnection[], intervalMs: number = 300000) {
    console.log(`Starting background price sync every ${intervalMs}ms...`);
    return setInterval(() => {
      console.log('Running scheduled background price sync...');
      connections.forEach(conn => {
        this.syncProducts(conn).catch(err => {
          console.error(`Background sync failed for connection ${conn.id}:`, err);
        });
      });
    }, intervalMs);
  }
};
