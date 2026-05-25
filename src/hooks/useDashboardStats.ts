import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';

export function useDashboardStats() {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ['dashboardStats', profile?.agencyId, profile?.uid],
    queryFn: async () => {
       // Ideally we fetch from /api/dashboard/stats
       // For now, provide solid default data.
       return {
         resellerBalance: 0,
         totalRevenue: 0,
         activeResellers: 1,
         successRate: 100,
         recentOrders: [],
         recentTransactions: []
       };
    },
    enabled: !!profile?.agencyId
  });
}
