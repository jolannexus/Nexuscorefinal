import React, { useState } from 'react';
import { 
  ClipboardList, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  ExternalLink,
  Target,
  Hash,
  RefreshCcw
} from 'lucide-react';
import { motion } from 'motion/react';
import { useOrders } from '../../hooks/useOrders';
import { cn } from '../../utils/cn';
import { format } from 'date-fns';

export const OrderHistory = () => {
  const { orders, loading, retryOrder } = useOrders();
  const [retryingId, setRetryingId] = useState<string | null>(null);

  const handleRetry = async (id: string) => {
    setRetryingId(id);
    try {
      await retryOrder(id);
    } catch (err) {
      console.error(err);
    } finally {
      setRetryingId(null);
    }
  };

  if (loading && !orders.length) {
    return <div className="h-48 flex items-center justify-center text-slate-500 text-xs font-semibold">Loading transactions...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-emerald-500" />
          Recent Transactions
        </h2>
        <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">{orders.length} RECORDS</span>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-xl w-full">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900">
              <th className="px-5 py-3 text-xs font-bold uppercase text-slate-500 tracking-wider">Transaction ID</th>
              <th className="px-5 py-3 text-xs font-bold uppercase text-slate-500 tracking-wider">Destination</th>
              <th className="px-5 py-3 text-xs font-bold uppercase text-slate-500 tracking-wider">Status</th>
              <th className="px-5 py-3 text-xs font-bold uppercase text-slate-500 tracking-wider">Timestamp</th>
              <th className="px-5 py-3 text-xs font-bold uppercase text-slate-500 tracking-wider text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50 font-sans">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-20 text-center flex flex-col items-center justify-center gap-2">
                  <span className="text-sm text-slate-400 font-bold uppercase tracking-wider">No completed orders</span>
                  <span className="text-xs text-slate-500 font-medium">Orders processed via API will appear here.</span>
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-5 py-4">
                    <div className="flex flex-col">
                      <span className="text-xs text-white font-bold tracking-tight">ORD_{order.id.slice(-8).toUpperCase()}</span>
                      <span className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                        <Hash className="w-2.5 h-2.5" />
                        {order.externalOrderId || 'Pending Supplier Sync'}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <Target className="w-3 h-3 text-slate-400" />
                      <span className="text-xs text-slate-400 group-hover:text-blue-400 transition-colors truncate max-w-[150px]">
                        {order.targetUrl}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className={cn(
                      "inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider border",
                      order.status === 'COMPLETED' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                      order.status === 'ERROR' ? "bg-red-500/10 text-red-500 border-red-500/20" :
                      "bg-blue-500/10 text-blue-500 border-blue-500/20"
                    )}>
                      {(order.status === 'PROCESSING' || retryingId === order.id) && <Loader2 className="w-2.5 h-2.5 animate-spin" />}
                      {order.status === 'COMPLETED' && <CheckCircle2 className="w-2.5 h-2.5" />}
                      {order.status === 'ERROR' && retryingId !== order.id && (
                        <button 
                          onClick={() => handleRetry(order.id)}
                          className="hover:scale-110 transition-transform active:scale-95"
                          title="Retry Fulfillment"
                        >
                          <RefreshCcw className="w-2.5 h-2.5" />
                        </button>
                      )}
                      {order.status}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-xs text-slate-500">
                    {order.createdAt ? format(order.createdAt.toDate(), 'HH:mm:ss // MM.dd') : 'Unknown'}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex flex-col items-end">
                      <span className="text-xs text-white font-bold">{order.quantity.toLocaleString()}</span>
                      <span className="text-xs text-slate-500 mt-1">${order.totalCost.toFixed(2)}</span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
