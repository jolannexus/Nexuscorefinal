import { Agency, Order, Product, User } from './types';

const API_BASE = '/api';

export const nexusApi = {
  // Tenant Information
  async getTenantConfig(slug: string): Promise<Agency> {
    const res = await fetch(`${API_BASE}/tenants/${slug}`);
    if (!res.ok) throw new Error('Tenant not found');
    return res.json();
  },

  // Wallet & User
  async getBalance(userId: string): Promise<{ balance: number }> {
    // In real implementation, this would be a secure GET with JWT
    return { balance: 1250.50 };
  },

  // Products
  async getProducts(): Promise<Product[]> {
    return [
      { 
        id: '1', 
        agencyId: 'mock-agency',
        name: '100 Diamonds', 
        category: 'Mobile Legends', 
        basePrice: 15.00, 
        status: 'ACTIVE',
        supplierId: 'mock-1',
        supplierName: 'Mock',
        appName: 'Mobile Legends',
        productCode: 'ML-100',
        syncedAt: new Date(),
        isEnabled: true
      },
    ];
  },

  // Branding settings
  async updateBrandingSettings(tenantId: string, branding: any): Promise<any> {
    const res = await fetch(`${API_BASE}/tenants/${tenantId}/branding`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(branding),
    });
    if (!res.ok) throw new Error('Failed to update branding');
    return res.json();
  },

  // Payment gateway settings
  async updatePaymentSettings(tenantId: string, settings: any): Promise<any> {
    const res = await fetch(`${API_BASE}/tenants/${tenantId}/payment`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    if (!res.ok) throw new Error('Failed to update payment settings');
    return res.json();
  },

  // Ordering
  async placeOrder(productId: string, customerData: string): Promise<Order> {
    const res = await fetch(`${API_BASE}/order/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, customerData }),
    });
    return res.json();
  },
  
  async getOrders(): Promise<Order[]> {
    const res = await fetch(`${API_BASE}/orders`);
    if (!res.ok) throw new Error('Failed to fetch orders');
    return res.json();
  }
};