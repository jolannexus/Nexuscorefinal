import React from 'react';
import { Code } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { SectionHeader } from '../../components/ui/SectionHeader';

export const ServiceMap = () => (
  <Card className="border-purple-900/20">
    <SectionHeader title="08. DECENTRALIZED DATA MAP" icon={Code} colorClass="text-purple-400" />
    <div className="space-y-2 relative">
      <div className="absolute left-3 top-2 bottom-2 w-px bg-slate-800" />
      {[
        { label: 'gateway.srv', type: 'Load Balancer', status: 'Running' },
        { label: 'order_bus.srv', type: 'RabbitMQ', status: 'Processing' },
        { label: 'ledger_db.srv', type: 'Postgres (ACID)', status: 'Syncing' },
        { label: 'cache_proxy.srv', type: 'Redis Cluster', status: 'Optimal' }
      ].map((s, i) => (
        <div key={i} className="flex items-center gap-4 pl-6 relative">
          <div className="absolute left-2.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-slate-700" />
          <div className="flex-1">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-slate-300 font-bold tracking-tight">{s.label}</span>
              <span className="text-xs font-bold text-emerald-500 uppercase">{s.status}</span>
            </div>
            <p className="text-xs text-slate-600 font-medium uppercase">{s.type}</p>
          </div>
        </div>
      ))}
    </div>
  </Card>
);
