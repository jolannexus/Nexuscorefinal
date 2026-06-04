import { useState, useEffect, useCallback } from 'react';
import { SupplierConnection } from '../types/index';
import { supplierService } from '../services/suppliers/supplierService';
import { useAuth } from '../contexts/AuthContext';

export const useSuppliers = () => {
  const [connections, setConnections] = useState<SupplierConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, profile } = useAuth();

  const fetchConnections = useCallback(async () => {
    if (!profile?.agencyId) return;
    setLoading(true);
    try {
      const data = await supplierService.getConnections(profile.agencyId);
      setConnections(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch connections');
    } finally {
      setLoading(false);
    }
  }, [profile?.agencyId]);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  const addConnection = async (data: Partial<SupplierConnection>) => {
    if (!profile?.agencyId) throw new Error('Not authenticated with agency');
    try {
      await supplierService.addConnection(profile.agencyId, data);
      await fetchConnections();
    } catch (err: any) {
      throw err;
    }
  };

  const deleteConnection = async (id: string) => {
    if (!profile?.agencyId) return;
    try {
      await supplierService.deleteConnection(profile.agencyId, id);
      setConnections(prev => prev.filter(c => c.id !== id));
    } catch (err: any) {
      throw err;
    }
  };

  const syncConnection = async (id: string) => {
    if (!profile?.agencyId) return;
    try {
      await supplierService.syncConnection(profile.agencyId, id);
      await fetchConnections();
    } catch (err: any) {
      throw err;
    }
  };

  const syncProducts = async (id: string) => {
    if (!profile?.agencyId) return;
    try {
      await supplierService.syncProducts(profile.agencyId, id);
      await fetchConnections();
    } catch (err: any) {
      throw err;
    }
  };

  const updateConnection = async (id: string, data: Partial<SupplierConnection>) => {
    if (!profile?.agencyId) return;
    try {
      await supplierService.updateConnection(profile.agencyId, id, data);
      await fetchConnections();
    } catch (err: any) {
      throw err;
    }
  };

  return {
    connections,
    loading,
    error,
    refresh: fetchConnections,
    addConnection,
    updateConnection,
    deleteConnection,
    syncConnection,
    syncProducts
  };
};
