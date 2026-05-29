import { Agency, Order, Product, User } from './types';
import { authService } from './services/authService';

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
    const token = authService.getToken();
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch balance');
    const data = await res.json();
    return { balance: data.user?.balance || 0 };
  },

  // Products
  async getProducts(): Promise<Product[]> {
    const token = authService.getToken();
    const res = await fetch(`${API_BASE}/products`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) return [];
    return res.json();
  },

  // Branding settings
  async updateBrandingSettings(tenantId: string, branding: any): Promise<any> {
    const token = authService.getToken();
    const res = await fetch(`${API_BASE}/tenants/${tenantId}/branding`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(branding),
    });
    if (!res.ok) throw new Error('Failed to update branding');
    return res.json();
  },

  // Payment gateway settings
  async updatePaymentSettings(tenantId: string, settings: any): Promise<any> {
    const token = authService.getToken();
    const res = await fetch(`${API_BASE}/tenants/${tenantId}/payment`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(settings),
    });
    if (!res.ok) throw new Error('Failed to update payment settings');
    return res.json();
  },

  // Ordering
  async placeOrder(productId: string, customerData: string): Promise<Order> {
    const token = authService.getToken();
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ productId, customerData }), // Note: backend expects quantity, targetAccount, resellerId, etc.
    });
    return res.json();
  },
  
  async getOrders(): Promise<Order[]> {
    const token = authService.getToken();
    const res = await fetch(`${API_BASE}/orders`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch orders');
    return res.json();
  }
};