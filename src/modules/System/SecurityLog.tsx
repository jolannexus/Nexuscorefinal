import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { SectionHeader } from '../../components/ui/SectionHeader';

export const SecurityLog = () => (
  <Card className="border-slate-800 bg-slate-950/40">
    <SectionHeader title="16. Security Audit" icon={ShieldCheck} colorClass="text-amber-500" />
    <div className="space-y-2">
      {[
        { action: 'API key rotated', user: 'admin_sys', time: '14:20:01', status: 'VERIFIED' },
        { action: 'Theme override', user: 'agency_04', time: '14:15:22', status: 'APPLIED' },
        { action: 'Threshold change', user: 'risk_mgr', time: '13:45:10', status: 'LOGGED' }
      ].map((log, i) => (
        <div key={i} className="flex items-center justify-between p-1.5 border-l-2 border-amber-500 bg-slate-900/50 rounded-r">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-200">{log.action}</span>
            <span className="text-xs text-slate-600 font-mono italic">{log.user} @ {log.time}</span>
          </div>
          <div className="px-1 py-0.5 rounded bg-amber-500/10 text-amber-500 text-xs font-bold tracking-wider">
            {log.status}
          </div>
        </div>
      ))}
    </div>
  </Card>
);
