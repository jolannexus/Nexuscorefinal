import { useState, useEffect, useCallback } from 'react';
import { Reseller } from '../types/index';
import { resellerService } from '../services/resellers/resellerService';
import { LedgerService } from '../services/billing/ledgerService';
import { useAuth } from '../contexts/AuthContext';

export const useResellers = () => {
  const [resellers, setResellers] = useState<Reseller[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, profile } = useAuth();

  const fetchResellers = useCallback(async () => {
    if (!profile?.agencyId) return;
    setLoading(true);
    try {
      const data = await resellerService.getResellers(profile.agencyId);
      setResellers(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch resellers');
    } finally {
      setLoading(false);
    }
  }, [profile?.agencyId]);

  useEffect(() => {
    fetchResellers();
  }, [fetchResellers]);

  const addReseller = async (name: string, email: string, balance?: number) => {
    if (!profile?.agencyId) throw new Error('Agency context missing');
    try {
      await resellerService.addReseller(profile.agencyId, { name, email, balance });
      await fetchResellers();
    } catch (err: any) {
      throw err;
    }
  };

  const updateBalance = async (id: string, amount: number) => {
    if (!profile?.agencyId) throw new Error('Agency context missing');
    try {
      await LedgerService.executeLedgerEntry({
        resellerId: id,
        agencyId: profile.agencyId,
        amount: Math.abs(amount),
        type: amount >= 0 ? 'CREDIT' : 'DEBIT',
        description: 'Manual adjustment by admin'
      });
      await fetchResellers();
    } catch (err: any) {
      throw err;
    }
  };

  const updateStatus = async (id: string, status: 'ACTIVE' | 'SUSPENDED') => {
    if (!profile?.agencyId) return;
    try {
      await resellerService.updateResellerStatus(profile.agencyId, id, status);
      setResellers(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    } catch (err: any) {
      throw err;
    }
  };

  const deleteReseller = async (id: string) => {
    if (!profile?.agencyId) return;
    try {
      await resellerService.deleteReseller(profile.agencyId, id);
      setResellers(prev => prev.filter(r => r.id !== id));
    } catch (err: any) {
      throw err;
    }
  };

  return {
    resellers,
    loading,
    error,
    refresh: fetchResellers,
    addReseller,
    updateBalance,
    updateStatus,
    deleteReseller
  };
};
