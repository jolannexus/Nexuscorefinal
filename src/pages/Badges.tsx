import React from 'react';
import { Card } from '../components/ui/Card';
import { 
  ShieldCheck, 
  Award, 
  Zap, 
  Users, 
  TrendingUp, 
  Star,
  Activity,
  Cpu
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../utils/cn';

const BADGES = [
  {
    id: 'gold_tier',
    name: 'Gold Partner',
    icon: ShieldCheck,
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    description: 'Active status for maintaining a monthly volume > IDR 10M.',
    requirements: 'Volume > 10M IDR',
    progress: 100
  },
  {
    id: 'speed_master',
    name: 'Fulfillment Elite',
    icon: Zap,
    color: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/20',
    description: 'Earned for maintaining an average fulfillment speed under 2 mins.',
    requirements: 'Speed < 120s',
    progress: 85
  },
  {
    id: 'reseller_king',
    name: 'Hub Commander',
    icon: Users,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    description: 'Unlocked by managing more than 50 active sub-reseller accounts.',
    requirements: '50+ Resellers',
    progress: 42
  },
  {
    id: 'growth_expert',
    name: 'Market Expansion',
    icon: TrendingUp,
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    description: 'Achieved 200% growth in quarterly transaction volume.',
    requirements: '200% Q/Q Growth',
    progress: 60
  }
];

export const BadgesPage = () => {
  return (
    <div className="space-y-8 max-w-7xl mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-indigo-500 rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.3)] text-white">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="text-4xl font-bold text-white uppercase tracking-tight leading-none">
              Badge Protocols
            </h1>
          </div>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider flex items-center gap-2">
            Professional Certification & Achievement Tracking
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {BADGES.map((badge, index) => (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  title={badge.name} 
                  subtitle="System Clearance Level"
                  className="h-full group hover:border-white/20 transition-all cursor-pointer overflow-hidden relative"
                >
                  <div className={cn(
                    "absolute top-0 right-0 w-24 h-24 blur-[80px] opacity-10 transition-opacity group-hover:opacity-30",
                    badge.color.replace('text', 'bg')
                  )} />
                  
                  <div className="flex gap-4 items-start mb-6">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border",
                      badge.bg, badge.color, badge.border
                    )}>
                      <badge.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-medium leading-relaxed mb-4">
                        {badge.description}
                      </p>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{badge.requirements}</span>
                        <span className="text-xs font-bold text-white uppercase tracking-wider ml-auto">{badge.progress}%</span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          className={cn("h-full rounded-full", badge.color.replace('text', 'bg'))}
                          initial={{ width: 0 }}
                          animate={{ width: `${badge.progress}%` }}
                          transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          <Card title="Recent Achievements" subtitle="Broadcast Feed">
             <div className="space-y-4">
                {[
                  { user: "TX_442", achievement: "Elite Seller Unlock", time: "2m ago", icon: Award },
                  { user: "JKT_01", achievement: "24h_Stability Streak", time: "5m ago", icon: Activity },
                  { user: "SUR_09", achievement: "New Tier Promoted", time: "12m ago", icon: TrendingUp },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                        <item.icon className="w-5 h-5 text-slate-500" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white uppercase">{item.achievement}</p>
                        <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">{item.user} // {item.time}</p>
                      </div>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                      <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Verified</span>
                    </div>
                  </div>
                ))}
             </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Reputation Meta" subtitle="Cluster Integrity">
            <div className="flex flex-col items-center text-center py-6">
               <div className="relative mb-6">
                 <div className="absolute inset-0 bg-primary blur-[100px] opacity-20 animate-pulse" />
                 <div className="w-24 h-24 rounded-full border-2 border-primary/20 flex items-center justify-center p-2">
                   <div className="w-full h-full rounded-full border-4 border-primary bg-slate-950 flex items-center justify-center">
                      <Star className="w-10 h-10 text-primary" />
                   </div>
                 </div>
               </div>
               <h3 className="text-2xl font-bold text-white tracking-tight uppercase mb-1">Platinum Rank</h3>
               <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-8">Clearance: Level_9</p>
               
               <div className="w-full space-y-4">
                 <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col items-start gap-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider leading-none">
                       <Cpu className="w-3.5 h-3.5 text-primary" />
                       Computing Power
                    </div>
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                       <div className="h-full bg-primary w-[75%]" />
                    </div>
                 </div>
                 <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col items-start gap-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider leading-none">
                       <Award className="w-3.5 h-3.5 text-blue-500" />
                       Loyalty Modifier
                    </div>
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                       <div className="h-full bg-blue-500 w-[90%]" />
                    </div>
                 </div>
               </div>
            </div>
          </Card>

          <Card title="Rank Benefits" subtitle="Tier: 1">
            <ul className="space-y-3">
              {[
                "2.5% Fulfillment Discount",
                "Priority Support Queue",
                "Custom Whitelabel Domain",
                "Advanced API Analytics",
                "Dedicated Account Manager"
              ].map((benefit, i) => (
                <li key={i} className="flex items-center gap-3 text-xs font-bold text-slate-400 uppercase tracking-wide">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  {benefit}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};
