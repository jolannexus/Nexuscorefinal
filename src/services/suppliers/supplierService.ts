import { SupplierConnection } from '../../types/index';
import { authService } from '../authService';

export const supplierService = {
  /**
   * Fetch connected suppliers for current tenant.
   */
  async getConnections(agencyId: string): Promise<SupplierConnection[]> {
    try {
      const token = authService.getToken();
      const response = await fetch('/api/suppliers', {
        headers: {
          'Authorization': 'Bearer ' + token
        }
      });
      if (response.ok) {
        return await response.json();
      }
      return [];
    } catch (error) {
      if ((import.meta as any).env.DEV) console.error('Failed to get supplier connections:', error);
      return [];
    }
  },

  /**
   * Add a connected supplier integration node.
   */
  async addConnection(agencyId: string, data: Partial<SupplierConnection>): Promise<string> {
    const token = authService.getToken();
    const response = await fetch('/api/suppliers', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({
        supplierName: data.supplierName,
        status: 'ACTIVE',
        credentials: data
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to add connection');
    }

    const saved = await response.json();
    return saved.id;
  },

  /**
   * Update connected supplier configuration.
   */
  async updateConnection(agencyId: string, id: string, data: Partial<SupplierConnection>): Promise<void> {
    try {
      const token = authService.getToken();
      await fetch('/api/suppliers', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({
          id,
          supplierName: data.supplierName,
          status: data.status,
          credentials: (data as any).credentials || data
        })
      });
    } catch (error) {
      if ((import.meta as any).env.DEV) console.error('Failed to update connection:', error);
    }
  },

  /**
   * Delete connected supplier entry.
   */
  async deleteConnection(agencyId: string, id: string): Promise<void> {
    try {
      const token = authService.getToken();
      await fetch(`/api/suppliers/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer ' + token
        }
      });
    } catch (error) {
      if ((import.meta as any).env.DEV) console.error('Failed to delete connection:', error);
    }
  },

  /**
   * Synchronize wallet balance with external supplier APIs.
   */
  async syncConnection(agencyId: string, id: string): Promise<void> {
    try {
      const token = authService.getToken();
      const conns = await this.getConnections(agencyId);
      const connection = conns.find(c => c.id === id);
      if (!connection) throw new Error("Connection not found");

      const response = await fetch('/api/suppliers/fetch-balance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({
          supplierName: connection.supplierName,
          credentials: connection.credentials || connection
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch balance from supplier');
      }
    } catch (error) {
      if ((import.meta as any).env.DEV) console.error('Balance sync failed:', error);
      throw error;
    }
  },

  /**
   * Pull active catalog products from external supplier node.
   */
  async syncProducts(agencyId: string, id: string): Promise<{ count: number; total: number }> {
    try {
      const token = authService.getToken();
      const conns = await this.getConnections(agencyId);
      const connection = conns.find(c => c.id === id);
      if (!connection) throw new Error("Connection not found");

      const response = await fetch('/api/suppliers/fetch-products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({
          supplierName: connection.supplierName,
          credentials: connection.credentials || connection
        })
      });

      if (!response.ok) {
        throw new Error('Failed to sync products');
      }

      const data = await response.json();
      const products = data.products || [];
      return { count: Math.min(products.length, 100), total: products.length };
    } catch (error) {
      if ((import.meta as any).env.DEV) console.error('Product sync failed:', error);
      throw error;
    }
  }
};
