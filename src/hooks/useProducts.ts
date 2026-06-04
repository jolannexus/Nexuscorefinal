import { useState, useEffect, useCallback } from 'react';
import { Product, SupplierConnection } from '../types/index';
import { productService } from '../services/products/productService';
import { useAuth } from '../contexts/AuthContext';

export const useProducts = () => {
  const { profile } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    if (!profile?.agencyId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await productService.getProducts(profile.agencyId);
      setProducts(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, [profile?.agencyId]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const syncProducts = async (connection: SupplierConnection) => {
    try {
      await productService.syncProducts(connection);
      await fetchProducts();
    } catch (err: any) {
      throw err;
    }
  };

  return {
    products,
    loading,
    error,
    refresh: fetchProducts,
    syncProducts
  };
};
