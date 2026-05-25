import React from 'react';
import { Users } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { SectionHeader } from '../../components/ui/SectionHeader';

export const QueueMatrix = () => (
  <Card className="border-indigo-900/30">
    <SectionHeader title="21. Customer Support" icon={Users} colorClass="text-indigo-400" />
    <div className="space-y-2">
      <div className="flex justify-between text-xs text-slate-500 font-bold uppercase mb-2">
        <span>Channel</span>
        <span>Waiting</span>
        <span>AHT</span>
      </div>
      {[
        { channel: 'WhatsApp', count: 12, aht: '4.2m' },
        { channel: 'LiveChat', count: 3, aht: '1.8m' },
        { channel: 'Ticket_E', count: 45, aht: '2h' }
      ].map((q, i) => (
        <div key={i} className="flex justify-between items-center py-1.5 border-b border-slate-800 last:border-0 font-mono text-white">
          <span className="text-xs text-indigo-300 font-bold">{q.channel}</span>
          <span className="text-xs text-white bg-indigo-500/20 px-2 rounded-full">{q.count}</span>
          <span className="text-xs text-slate-500">{q.aht}</span>
        </div>
      ))}
      <div className="mt-2 text-center">
         <button className="text-xs text-indigo-500 uppercase font-bold tracking-wider hover:text-indigo-400 transition-colors">
           Manage Support Agents {'->'}
         </button>
      </div>
    </div>
  </Card>
);
