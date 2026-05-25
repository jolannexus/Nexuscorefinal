import React from 'react';
import { Layers } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { SectionHeader } from '../../components/ui/SectionHeader';

export const FlotillaMonitor = () => (
  <Card className="border-purple-900/40 bg-purple-950/5">
    <SectionHeader title="31. White Label Monitors" icon={Layers} colorClass="text-purple-400" />
    <div className="space-y-3">
      <div className="flex justify-between items-center px-2 py-1 bg-purple-500/10 rounded border border-purple-500/20">
         <span className="text-xs text-purple-300 font-bold tracking-wider">Active Tenants: 24</span>
         <span className="text-xs text-emerald-400 font-mono">100% HEALTHY</span>
      </div>
      {[
        { name: 'GamerStore ID', orders: 142, revenue: 'IDR 4.2M', status: 'LIVE' },
        { name: 'VoucherHub Alt', orders: 89, revenue: 'IDR 1.8M', status: 'LIVE' },
        { name: 'Topup Express', orders: 12, revenue: 'IDR 250k', status: 'IDLE' }
      ].map((t, i) => (
        <div key={i} className="flex justify-between items-center p-2 bg-slate-950 rounded border border-slate-800">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-200">{t.name}</span>
            <span className="text-xs text-slate-600 font-mono italic">{t.orders} txn today</span>
          </div>
          <div className="text-right">
             <p className="text-xs font-medium font-bold text-white">{t.revenue}</p>
             <span className="text-xs text-purple-500 font-bold tracking-tight uppercase">{t.status}</span>
          </div>
        </div>
      ))}
      <button className="w-full py-1.5 border border-dashed border-purple-500/30 rounded text-xs text-purple-500 font-bold hover:bg-purple-500/10 transition-all uppercase">
        Deploy New Tenant Instance
      </button>
    </div>
  </Card>
);
