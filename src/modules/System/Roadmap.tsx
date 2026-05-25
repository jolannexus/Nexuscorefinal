import React from 'react';
import { Rocket } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { SectionHeader } from '../../components/ui/SectionHeader';

export const Roadmap = () => (
  <Card className="col-span-1 border-emerald-900/30">
    <SectionHeader title="07. MVP ROADMAP" icon={Rocket} colorClass="text-emerald-400" />
    <div className="space-y-4 ml-1 pl-4 border-l border-slate-800">
      <div className="relative">
        <div className="absolute -left-[21px] top-1 w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
        <p className="text-xs font-bold text-white uppercase">Phase 1: Core Ledger</p>
        <p className="text-xs text-slate-500">Atomic balance resolution and basic API.</p>
      </div>
      <div className="relative opacity-40">
        <div className="absolute -left-[21px] top-1 w-2 h-2 rounded-full bg-slate-700" />
        <p className="text-xs font-bold text-slate-400 uppercase">Phase 2: Tenant CMS</p>
      </div>
    </div>
  </Card>
);
