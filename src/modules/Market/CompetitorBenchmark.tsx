import React from 'react';
import { TrendingUp } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { cn } from '../../utils/cn';

export const CompetitorBenchmark = () => (
  <Card className="border-amber-900/30">
    <SectionHeader title="32. Market Benchmark" icon={TrendingUp} colorClass="text-amber-500" />
    <div className="space-y-3">
       {[
         { item: 'ML 100 DM', our: '14.2k', market: '14.5k', diff: '-2.1%', status: 'WINNING' },
         { item: 'VAL 100 VP', our: '125k', market: '122k', diff: '+2.4%', status: 'LOSING' },
         { item: 'PUBG 60 UC', our: '14.0k', market: '14.0k', diff: '0.0%', status: 'EQUAL' }
       ].map((b, i) => (
         <div key={i} className="space-y-1">
            <div className="flex justify-between items-center text-xs">
               <span className="text-slate-400 font-bold">{b.item}</span>
               <span className={cn(
                 "font-bold tracking-tight",
                 b.status === 'WINNING' ? "text-emerald-500" : b.status === 'LOSING' ? "text-red-500" : "text-slate-500"
               )}>{b.status}</span>
            </div>
            <div className="flex items-center gap-2">
               <div className="flex-1 h-3 bg-slate-900 rounded flex items-center px-2 border border-slate-800 relative overflow-hidden">
                  <div className="text-xs font-medium text-white">OUR: {b.our}</div>
                  <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5" />
               </div>
               <div className="text-xs font-medium font-bold text-slate-500 w-12 text-center">{b.diff}</div>
            </div>
         </div>
       ))}
       <p className="text-xs text-slate-600 italic text-center mt-2">Scraping Marketplace Data every 15m...</p>
    </div>
  </Card>
);
