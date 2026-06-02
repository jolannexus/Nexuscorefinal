import { useState, useEffect, useCallback } from 'react';
import { Order, SupplierConnection } from '../types/index';
import { orderService } from '../services/orders/orderService';
import { useAuth } from '../contexts/AuthContext';

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, profile } = useAuth();

  const fetchOrders = useCallback(async () => {
    if (!profile?.agencyId) return;
    setLoading(true);
    try {
      const data = await orderService.getOrders(profile.agencyId);
      setOrders(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, [profile?.agencyId]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const placeOrder = async (
    resellerId: string, 
    productId: string, 
    quantity: number, 
    targetUrl: string,
    supplierConnection: SupplierConnection
  ) => {
    try {
      const orderId = await orderService.placeOrder(resellerId, productId, quantity, targetUrl, supplierConnection);
      await fetchOrders();
      
      // Auto-process order
      if (profile?.agencyId) {
        orderService.processOrder(profile.agencyId, orderId).then(() => {
          fetchOrders();
        }).catch(err => {
          
          fetchOrders();
        });
      }
      
      return orderId;
    } catch (err: any) {
      throw err;
    }
  };

  const retryOrder = async (orderId: string) => {
    if (!profile?.agencyId) return;
    try {
      await orderService.processOrder(profile.agencyId, orderId);
      await fetchOrders();
    } catch (err: any) {
      
      throw err;
    }
  };

  return {
    orders,
    loading,
    error,
    refresh: fetchOrders,
    placeOrder,
    retryOrder
  };
};
