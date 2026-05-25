import React from 'react';
import { TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';
import { Card } from '../../components/ui/Card';
import { SectionHeader } from '../../components/ui/SectionHeader';

export const PlatformProfit = () => (
  <Card className="border-indigo-900/40 bg-indigo-950/10">
    <SectionHeader title="36. Platform Profit" icon={TrendingUp} colorClass="text-indigo-400" />
    <div className="grid grid-cols-2 gap-4 mt-2">
      <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-1">
        <p className="text-xs text-slate-500 font-bold uppercase">Total Hub Revenue (24h)</p>
        <p className="text-sm font-medium font-bold text-white">IDR 142.5M</p>
        <p className="text-xs text-emerald-500 font-mono">+12.4% vs prev_day</p>
      </div>
      <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-1">
        <p className="text-xs text-slate-500 font-bold uppercase">Net Platform Spread</p>
        <p className="text-sm font-medium font-bold text-emerald-400">IDR 2.85M</p>
        <p className="text-xs text-slate-500 font-mono">Avg. 2% Markup applied</p>
      </div>
    </div>
    <div className="mt-4 space-y-2">
       <div className="flex justify-between items-center text-xs px-1">
          <span className="text-slate-500 font-bold">REVENUE SOURCES</span>
          <span className="text-indigo-400 font-bold">78% AUTO-PILOT</span>
       </div>
       <div className="space-y-1.5">
          {[
            { label: 'SaaS Tenant Fees', val: '45%' },
            { label: 'Transaction Spread', val: '35%' },
            { label: 'Premium Add-ons', val: '20%' }
          ].map((s, i) => (
            <div key={i} className="flex flex-col gap-1">
               <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-400">{s.label}</span>
                  <span className="text-white">{s.val}</span>
               </div>
               <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: s.val }}
                    className="h-full bg-indigo-500"
                  />
               </div>
            </div>
          ))}
       </div>
    </div>
  </Card>
);
