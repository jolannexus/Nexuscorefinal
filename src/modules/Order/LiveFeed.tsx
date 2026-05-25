import React, { useState, useEffect } from 'react';
import { TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';
import { Card } from '../../components/ui/Card';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { Order } from '../../types/index';
import { cn } from '../../utils/cn';

export const LiveFeed = () => {
  const [orders, setOrders] = useState<any[]>([
    { id: '#8891', sku: 'ML_50_DM', price: 'IDR 7.200', status: 'SUCCESS', time: 'Just now' },
    { id: '#8890', sku: 'VAL_1125_VP', price: 'IDR 125.000', status: 'PROCESSING', time: '1m ago' },
    { id: '#8889', sku: 'PUBG_60_UC', price: 'IDR 14.000', status: 'SUCCESS', time: '2m ago' }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      const skus = ['ML_100_DM', 'FF_50_DM', 'PUBG_60_UC', 'VAL_100_VP'];
      const newOrder: any = {
        id: `#${Math.floor(Math.random() * 1000) + 9000}`,
        sku: skus[Math.floor(Math.random() * skus.length)],
        price: `IDR ${Math.floor(Math.random() * 50000 + 5000).toLocaleString()}`,
        status: Math.random() > 0.1 ? 'SUCCESS' : 'FAILED',
        time: 'Just now'
      };
      setOrders(prev => [newOrder, ...prev.slice(0, 4)]);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="border-emerald-900/40 bg-emerald-950/5">
      <SectionHeader title="15. Live Transaction Feed" icon={TrendingUp} colorClass="text-emerald-400" />
      <div className="space-y-2">
        {orders.map((o) => (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            key={o.id} 
            className="flex items-center justify-between p-2 bg-slate-950 rounded border border-slate-800"
          >
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-200">{o.id} <span className="text-slate-500 font-mono">[{o.sku}]</span></span>
              <span className="text-xs text-slate-600 font-mono italic">{o.time}</span>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-emerald-400">{o.price}</p>
              <p className={cn(
                "text-xs font-bold uppercase tracking-tight",
                o.status === 'SUCCESS' ? "text-emerald-500" : "text-red-500"
              )}>{o.status}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
};
