import React, { useState } from 'react';
import { ResellerModule } from '../modules/resellers/ResellerModule';
import { TransactionList } from '../modules/billing/TransactionList';
import { Users, Search, Filter, TrendingUp, Award, BarChart3, ArrowRight } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { useTranslation } from 'react-i18next';

export const ResellersPage = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'leaderboard'>('overview');

  return (
    <div className="max-w-[1400px] mx-auto py-8">
      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl lg:text-4xl font-semibold text-white tracking-tight">{t('resellers.title')}</h1>
          <p className="text-[13px] text-slate-500 font-medium mt-2 flex items-center gap-2">
            {t('resellers.subtitle')}
          </p>
        </div>
        
        <div className="flex bg-white/5 border border-white/10 p-1.5 rounded-xl">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`px-5 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'overview' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-500 hover:text-white'
            }`}
          >
            {t('resellers.overview')}
          </button>
          <button 
            onClick={() => setActiveTab('performance')}
            className={`px-5 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'performance' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-500 hover:text-white'
            }`}
          >
            {t('resellers.performance')}
          </button>
          <button 
            onClick={() => setActiveTab('leaderboard')}
            className={`px-5 py-2 rounded-lg text-xs font-semibold transition-all ${
               activeTab === 'leaderboard' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-500 hover:text-white'
            }`}
          >
            {t('resellers.leaderboard')}
          </button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="px-5 py-4">
              <div className="flex justify-between items-start mb-2">
                <div className="p-2 bg-white/5 rounded-lg">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded uppercase tracking-widest">+12%</span>
              </div>
              <div className="text-[11px] text-slate-500 mb-1 font-semibold uppercase tracking-widest">{t('resellers.activePartners')}</div>
              <div className="text-2xl font-semibold text-white tracking-tight">42</div>
            </Card>
            <Card className="px-5 py-4">
              <div className="flex justify-between items-start mb-2">
                <div className="p-2 bg-white/5 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded uppercase tracking-widest">+5.2%</span>
              </div>
              <div className="text-[11px] text-slate-500 mb-1 font-semibold uppercase tracking-widest">{t('resellers.totalVolume')}</div>
              <div className="text-2xl font-semibold text-white tracking-tight">IDR 1.2B</div>
            </Card>
            <Card className="px-5 py-4">
              <div className="flex justify-between items-start mb-2">
                <div className="p-2 bg-white/5 rounded-lg">
                  <BarChart3 className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="text-[11px] text-slate-500 mb-1 font-semibold uppercase tracking-widest">{t('resellers.avgMargin')}</div>
              <div className="text-2xl font-semibold text-emerald-400 tracking-tight">18.5%</div>
            </Card>
            <Card className="px-5 py-4 bg-white/[0.02]">
              <div className="flex items-center gap-3 h-full cursor-pointer hover:opacity-80 transition-opacity">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                  <ArrowRight className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{t('resellers.brandingPanel')}</div>
                  <div className="text-[11px] text-slate-500">{t('resellers.customizePortal')}</div>
                </div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <ResellerModule />
            </div>
            <div className="space-y-6">
               <Card title={t('resellers.liveActivity')} subtitle={t('resellers.networkTransactions')}>
                  <TransactionList />
               </Card>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'performance' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             <Card title={t('resellers.monthlyVolumeTrend')} subtitle={t('resellers.monthlyVolumeTrendSub')} className="min-h-[300px]">
               <div className="h-full flex items-center justify-center pt-8 pb-4">
                 <div className="w-full flex items-end justify-between h-48 px-4 gap-2">
                   {[40, 60, 45, 80, 55, 90, 75, 100].map((h, i) => (
                     <div key={i} className="w-full bg-white/5 rounded-t-lg relative group transition-all hover:bg-emerald-500/20" style={{ height: `${h}%` }}>
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-xs text-white px-2 py-1 rounded font-mono">
                          {h * 1.5}M
                        </div>
                     </div>
                   ))}
                 </div>
               </div>
             </Card>
             <Card title={t('resellers.commissionDistribution')} subtitle={t('resellers.commissionDistributionSub')} className="min-h-[300px]">
                <div className="space-y-6 mt-6">
                  {[
                    { label: t('resellers.platinumPartners'), value: 68, color: 'bg-indigo-500' },
                    { label: t('resellers.goldPartners'), value: 24, color: 'bg-amber-500' },
                    { label: t('resellers.silverPartners'), value: 8, color: 'bg-slate-400' }
                  ].map(stat => (
                    <div key={stat.label} className="space-y-2">
                       <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider">
                          <span className="text-slate-400">{stat.label}</span>
                          <span className="text-white">{stat.value}%</span>
                       </div>
                       <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                          <div className={`h-full ${stat.color} rounded-full`} style={{ width: `${stat.value}%` }} />
                       </div>
                    </div>
                  ))}
                </div>
             </Card>
           </div>
        </div>
      )}

      {activeTab === 'leaderboard' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
           <Card className="p-0 overflow-hidden">
              <div className="p-6 border-b border-white/5">
                 <h3 className="text-lg font-semibold text-white">{t('resellers.topPerforming')}</h3>
                 <p className="text-[13px] text-slate-500 mt-1">{t('resellers.rankingSubtitle')}</p>
              </div>
              <div className="divide-y divide-white/5">
                {[
                  { name: "Nexus Elite Gaming", tier: "PLATINUM", volume: "IDR 458M", growth: "+14%", rank: 1 },
                  { name: "Pulse Digital", tier: "PLATINUM", volume: "IDR 312M", growth: "+8%", rank: 2 },
                  { name: "Velocity Topup", tier: "GOLD", volume: "IDR 145M", growth: "+22%", rank: 3 },
                  { name: "Apex Store", tier: "SILVER", volume: "IDR 89M", growth: "-2%", rank: 4 },
                  { name: "Streamer Hub", tier: "SILVER", volume: "IDR 42M", growth: "+5%", rank: 5 }
                ].map((partner, i) => (
                   <div key={partner.name} className="flex items-center justify-between p-6 hover:bg-white/[0.02] transition-colors">
                      <div className="flex items-center gap-6">
                         <div className="w-8 text-center text-xl font-bold font-mono text-slate-600">
                           #{partner.rank}
                         </div>
                         <div>
                            <div className="text-sm font-semibold text-white tracking-tight">{partner.name}</div>
                            <div className="flex items-center gap-2 mt-1">
                               <span className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded ${
                                 partner.tier === 'PLATINUM' ? 'bg-indigo-500/10 text-indigo-400' :
                                 partner.tier === 'GOLD' ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-500/10 text-slate-400'
                               }`}>
                                 {partner.tier}
                               </span>
                            </div>
                         </div>
                      </div>
                      <div className="text-right">
                         <div className="text-sm font-bold text-white font-mono">{partner.volume}</div>
                         <div className={`text-[11px] font-bold mt-1 ${partner.growth.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}`}>
                           {partner.growth}
                         </div>
                      </div>
                   </div>
                ))}
              </div>
           </Card>
        </div>
      )}
    </div>
  );
};

