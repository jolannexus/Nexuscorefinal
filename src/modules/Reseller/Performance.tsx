import React from 'react';
import { Users } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { cn } from '../../utils/cn';

export const Performance = () => (
  <Card className="border-indigo-900/40 bg-indigo-950/5">
    <SectionHeader title="12. Partner Metrics" icon={Users} colorClass="text-indigo-400" />
    <div className="space-y-3">
      {[
        { name: 'GamerStore Bali', tier: 'PLATINUM', volume: 'Rp 45.2M', growth: '+12.4%' },
        { name: 'Topup Sakti_JKT', tier: 'GOLD', volume: 'Rp 21.8M', growth: '+5.2%' },
        { name: 'Raja Diamond_MDN', tier: 'SILVER', volume: 'Rp 12.5M', growth: '-2.1%' }
      ].map((r, i) => (
        <div key={i} className="relative group">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-slate-300">{r.name}</span>
            <span className="text-xs font-medium text-indigo-400 font-bold">{r.volume}</span>
          </div>
          <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
             <div className="h-full bg-indigo-500" style={{ width: i === 0 ? '85%' : i === 1 ? '60%' : '40%' }} />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-slate-600 font-bold uppercase tracking-wider">{r.tier}</span>
            <span className={cn("text-xs font-medium", r.growth.startsWith('+') ? "text-emerald-500" : "text-red-500")}>{r.growth}</span>
          </div>
        </div>
      ))}
    </div>
  </Card>
);
