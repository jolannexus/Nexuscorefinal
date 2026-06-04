import React from 'react';
import { Package, Power, PowerOff, RefreshCw } from 'lucide-react';
import { Product } from '../../types';

interface ProductStatsProps {
  products: Product[];
}

export const ProductStats: React.FC<ProductStatsProps> = ({ products }) => {
  const safeProducts = Array.isArray(products) ? products : [];
  const activeCount = safeProducts.filter(p => p.isEnabled).length;
  const disabledCount = safeProducts.filter(p => !p.isEnabled).length;
  const supplierCount = new Set(safeProducts.map(p => p.supplierId)).size;

  const stats = [
    { label: 'Total Services', value: safeProducts.length, icon: Package, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { label: 'Active Channels', value: activeCount, icon: Power, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Disabled Units', value: disabledCount, icon: PowerOff, color: 'text-red-500', bg: 'bg-red-500/10' },
    { label: 'Connected Providers', value: supplierCount, icon: RefreshCw, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <div key={i} className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 p-5 rounded-2xl">
          <div className="flex justify-between items-start mb-4">
            <div className={`p-2 rounded-xl ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-mono font-bold text-white mb-1">{stat.value}</div>
          <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">{stat.label}</div>
        </div>
      ))}
    </div>
  );
};
