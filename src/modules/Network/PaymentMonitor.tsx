import React from 'react';
import { Activity } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { cn } from '../../utils/cn';

export const PaymentMonitor = () => (
  <Card className="border-cyan-900/40 bg-cyan-950/5">
    <SectionHeader title="20. Payment Channels" icon={Activity} colorClass="text-cyan-400" />
    <div className="grid grid-cols-2 gap-2">
      {[ 
        { name: 'QRIS Static', status: 'Optimal', delay: '1.2s' },
        { name: 'Gopay', status: 'Optimal', delay: '0.8s' },
        { name: 'BCA VA', status: 'Stable', delay: '2.5s' },
        { name: 'OVO', status: 'Degraded', delay: '8.4s' }
      ].map((c, i) => (
        <div key={i} className="p-2 bg-slate-950 rounded border border-slate-800 space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-tight">{c.name}</span>
            <div className={cn("w-1 h-1 rounded-full", c.status === 'Optimal' ? "bg-emerald-500" : c.status === 'Stable' ? "bg-blue-500" : "bg-amber-500")} />
          </div>
          <div className="flex justify-between items-end">
            <span className={cn("text-xs font-bold uppercase", c.status === 'Optimal' ? "text-emerald-400" : c.status === 'Stable' ? "text-blue-400" : "text-amber-400")}>{c.status}</span>
            <span className="text-xs font-medium text-slate-600">{c.delay}</span>
          </div>
        </div>
      ))}
    </div>
  </Card>
);
