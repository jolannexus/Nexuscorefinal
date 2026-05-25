import React from 'react';
import { Database } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { SectionHeader } from '../../components/ui/SectionHeader';

export const Aggregator = () => (
  <Card className="border-orange-900/40 bg-orange-950/5">
    <SectionHeader title="23. Cross-Supplier Aggregator" icon={Database} colorClass="text-orange-400" />
    <div className="space-y-2">
      <p className="text-xs text-slate-500 italic mb-2 leading-tight">
        Automatically fulfills SKUs from alternative suppliers if primary is OOS or unavailable.
      </p>
      {[
        { sku: 'ML_50_DM', s1: 'Digiflazz (Active)', s2: 'ApiGames (Backup)', status: 'SYNCED' },
        { sku: 'VAL_100_VP', s1: 'Unipin (Active)', s2: 'Digiflazz (Backup)', status: 'SYNCED' },
        { sku: 'FF_100_DM', s1: 'ApiGames (Active)', s2: 'Manual (Backup)', status: 'HYBRID' }
      ].map((p, i) => (
        <div key={i} className="flex flex-col gap-1 p-2 bg-slate-950/60 rounded border border-slate-800">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-white font-mono">{p.sku}</span>
            <span className="text-xs px-1 bg-orange-500/10 text-orange-400 font-bold rounded">{p.status}</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 text-xs text-slate-500 truncate">1: {p.s1}</div>
            <div className="w-2 h-[1px] bg-slate-800" />
            <div className="flex-1 text-xs text-slate-400 truncate">2: {p.s2}</div>
          </div>
        </div>
      ))}
    </div>
  </Card>
);
