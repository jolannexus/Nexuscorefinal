import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { DiscountManager } from '../modules/Marketing/DiscountManager';
import { Sparkles, Megaphone, TrendingUp, BarChart3 } from 'lucide-react';
import { motion } from 'motion/react';
import { Card } from '../components/ui/Card';

export const MarketingPage = () => {
  const { profile } = useAuth();

  if (!profile?.agencyId) return null;

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-semibold text-white tracking-tight">
              Marketing
            </h2>
          </div>
          <p className="text-sm text-slate-500 font-medium pt-1">
            Manage your promotional campaigns
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="md:col-span-2">
            <DiscountManager agencyId={profile.agencyId} />
         </div>
         <div className="space-y-6">
            <Card className="p-6 relative overflow-hidden group">
               <h4 className="text-[12px] font-semibold text-slate-500 uppercase tracking-widest mb-2">Active Campaigns</h4>
               <p className="text-3xl font-semibold text-white tracking-tight mb-4">0</p>
               <p className="text-[13px] text-slate-400 font-medium leading-relaxed">Create a new discount campaign to engage your customers.</p>
            </Card>

            <Card className="p-8">
               <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                    <BarChart3 className="w-4 h-4 text-indigo-400" />
                  </div>
                  <span className="text-[11px] font-semibold text-white uppercase tracking-widest">Active Streams</span>
               </div>
               <div className="space-y-4">
                  {[1,2,3].map(i => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0 opacity-20">
                       <div className="w-24 h-2 bg-white/20 rounded-full" />
                       <div className="w-12 h-2 bg-indigo-500/30 rounded-full" />
                    </div>
                  ))}
               </div>
               <p className="text-center mt-6 text-[10px] font-semibold text-slate-600 uppercase tracking-widest italic">Aggregation In Progress...</p>
            </Card>
         </div>
      </div>
    </div>
  );
};
