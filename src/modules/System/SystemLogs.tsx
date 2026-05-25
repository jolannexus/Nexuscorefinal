import React from 'react';
import { Activity } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { SectionHeader } from '../../components/ui/SectionHeader';

export const SystemLogs = () => (
  <Card className="flex-1 bg-slate-950/40">
    <SectionHeader title="Realtime Logs" icon={Activity} colorClass="text-slate-500" />
    <div className="space-y-2 font-medium text-xs">
      <div className="flex gap-2 text-emerald-500/80">
        <span>[14:22:02]</span>
        <span className="font-bold">System Status</span>
        <span className="text-slate-400">Successfully updated theme settings.</span>
      </div>
      <div className="flex gap-2 text-blue-500/80">
        <span>[12:41:15]</span>
        <span className="font-bold">Order Processed</span>
        <span className="text-slate-400">Processed recent order request.</span>
      </div>
    </div>
  </Card>
);
