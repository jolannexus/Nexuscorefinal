import { Transaction } from '../../types/index';
import { authService } from '../authService';
import { financialLogger } from '../../lib/logger';

export class BillingService {
  static async getPendingDeposits(agencyId: string): Promise<Transaction[]> {
    try {
      const token = authService.getToken();
      const response = await fetch(`/api/billing/deposit/pending?agencyId=${agencyId}`, {
        headers: {
          'Authorization': 'Bearer ' + token
        }
      });
      if (!response.ok) throw new Error("Failed to fetch pending deposits");
      return await response.json();
    } catch (err) {
      financialLogger.error({ error: err }, 'Billing service error');
      return [];
    }
  }

  static async approveDeposit(tx: Transaction): Promise<boolean> {
    const token = authService.getToken();
    const response = await fetch('/api/billing/deposit/approve', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({ transaction: tx })
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to approve deposit');
    }
    return true;
  }

  static async rejectDeposit(agencyId: string, id: string): Promise<boolean> {
    const token = authService.getToken();
    const response = await fetch('/api/billing/deposit/reject', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({ agencyId, id })
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to reject deposit');
    }
    return true;
  }

  static async requestDeposit(params: {
    resellerId: string;
    agencyId: string;
    amount: number;
    paymentMethod: string;
  }): Promise<boolean> {
    const token = authService.getToken();
    const response = await fetch('/api/billing/deposit/request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify(params)
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to request deposit');
    }
    return true;
  }
}
