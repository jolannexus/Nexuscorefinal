import React from 'react';
import { Zap } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { SectionHeader } from '../../components/ui/SectionHeader';

export const BalanceAlerts = () => (
  <Card className="border-red-900/30 bg-red-950/5">
    <SectionHeader title="System Alerts" icon={Zap} colorClass="text-red-400" />
    <div className="space-y-2">
      <div className="p-2 bg-red-500/10 border border-red-500/20 rounded flex items-center gap-3">
        <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
        <div>
          <p className="text-xs font-bold text-red-200 uppercase tracking-tight">Low Liquidity: Digiflazz</p>
          <p className="text-xs text-red-500/80 font-mono">Balance: Rp 450.200 (Threshold: 1M)</p>
        </div>
      </div>
      <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded flex items-center gap-3 opacity-60">
        <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        <div>
          <p className="text-xs font-bold text-amber-200 uppercase tracking-tight">SSL EXPIRY WARNING</p>
          <p className="text-xs text-amber-500/80 font-mono">Domain: store.nexus.id (7 Days Left)</p>
        </div>
      </div>
    </div>
  </Card>
);
