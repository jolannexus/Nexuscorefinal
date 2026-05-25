import React, { useState } from 'react';
import { Settings2 } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { cn } from '../../utils/cn';

export const RoutingEngine = () => (
  <Card className="border-indigo-900/30">
    <SectionHeader title="24. Smart Routing Logic" icon={Settings2} colorClass="text-indigo-400" />
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold text-slate-500 uppercase">Routing strategy</label>
        <div className="grid grid-cols-2 gap-2">
          {['Lowest Cost', 'Highest Speed', 'Most Stable', 'Manual Priority'].map((s, i) => (
            <button key={i} className={cn(
              "text-xs py-1.5 px-2 rounded border font-bold text-left transition-all",
              i === 0 ? "border-indigo-500/50 bg-indigo-500/10 text-white" : "border-slate-800 bg-slate-950 text-slate-600"
            )}>
              {s}
            </button>
          ))}
        </div>
      </div>
      <div className="p-2 bg-slate-950 rounded border border-dashed border-slate-800">
        <div className="flex justify-between items-center mb-2">
           <span className="text-xs text-slate-500 font-bold uppercase">Realtime Example</span>
           <span className="text-xs text-emerald-500 animate-pulse font-mono font-bold">CALCULATING...</span>
        </div>
        <p className="text-xs text-slate-400 font-mono leading-relaxed">
          Order [ML_100] {'->'} <br/>
          S1: IDR 14.200 (Stable) <br/>
          S2: IDR 13.950 (Healthy) <br/>
          <span className="text-white">WINNER: S2 (Saves IDR 250)</span>
        </p>
      </div>
    </div>
  </Card>
);
