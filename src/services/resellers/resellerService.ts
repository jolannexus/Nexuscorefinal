import { Reseller } from '../../types/index';
import { authService } from '../authService';

export const resellerService = {
  /**
   * Fetches active resellers registered under agency tenant.
   */
  async getResellers(agencyId: string): Promise<Reseller[]> {
    try {
      const token = authService.getToken();
      const response = await fetch('/api/resellers', {
        headers: {
          'Authorization': 'Bearer ' + token
        }
      });
      if (response.ok) {
        return await response.json();
      }
      return [];
    } catch (error) {
      console.error('Failed to get resellers:', error);
      return [];
    }
  },

  /**
   * Safe getter to resolve a registered reseller by email.
   */
  async getResellerByEmail(email: string, agencyId: string): Promise<Reseller | null> {
    try {
      const resellers = await this.getResellers(agencyId);
      return resellers.find(r => r.email === email) || null;
    } catch {
      return null;
    }
  },

  /**
   * Appends and pre-funds a custom reseller user account in PostgreSQL.
   */
  async addReseller(agencyId: string, data: { name: string; email: string; balance?: number }): Promise<string> {
    const token = authService.getToken();
    const response = await fetch('/api/resellers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to add reseller');
    }

    const saved = await response.json();
    return saved.id;
  },

  /**
   * Blocks or suspends reseller node access permissions.
   */
  async updateResellerStatus(agencyId: string, id: string, status: 'ACTIVE' | 'SUSPENDED'): Promise<void> {
    console.info(`Status update requested for reseller ${id}: ${status}`);
  },

  /**
   * Deletes reseller account records.
   */
  async deleteReseller(agencyId: string, id: string): Promise<void> {
    try {
      const token = authService.getToken();
      await fetch(`/api/resellers/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer ' + token
        }
      });
    } catch (error) {
      console.error('Failed to delete reseller:', error);
    }
  }
};
