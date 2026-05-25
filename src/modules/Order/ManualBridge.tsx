import React from 'react';
import { Target } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { SectionHeader } from '../../components/ui/SectionHeader';

export const ManualBridge = () => (
  <Card className="border-amber-900/30 bg-amber-950/5">
    <SectionHeader title="27. Manual Fulfillment" icon={Target} colorClass="text-amber-500" />
    <div className="space-y-2">
      <p className="text-xs text-slate-500 italic mb-2">Used for boutique apps or when all APIs are OOS.</p>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between p-2 bg-slate-950 rounded border border-amber-500/20">
          <div className="flex flex-col">
             <span className="text-xs font-bold text-white">Niche Game v2</span>
             <span className="text-xs text-amber-500 font-mono">1 QUEUED ORDER</span>
          </div>
          <button className="px-2 py-1 bg-amber-600 text-white text-xs font-bold rounded uppercase">Process</button>
        </div>
        <div className="p-2 border border-dashed border-slate-800 rounded flex items-center justify-center">
            <span className="text-xs text-slate-600 uppercase font-bold tracking-wider">+ Add Manual Channel</span>
        </div>
      </div>
    </div>
  </Card>
);
