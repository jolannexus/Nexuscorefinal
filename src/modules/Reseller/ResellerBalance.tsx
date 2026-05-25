import React, { useState, useEffect } from 'react';
import { Wallet, Plus, ArrowUpRight, History, ShieldCheck } from 'lucide-react';
import { resellerService } from '../../services/resellers/resellerService';
import { useAuth } from '../../contexts/AuthContext';
import { diagnostics } from '../../utils/diagnostics';
import { Reseller } from '../../types/index';
import { cn } from '../../utils/cn';
import { TopUpForm } from './TopUpForm';

export const ResellerBalance = () => {
  diagnostics.logRender('ResellerBalance');
  const { user, profile: authProfile } = useAuth();
  const [profile, setProfile] = useState<Reseller | null>(null);
  const [showTopUp, setShowTopUp] = useState(false);

  useEffect(() => {
    if (user?.email && authProfile?.agencyId) {
      loadProfile(authProfile.agencyId);
    }
  }, [user?.email, authProfile?.agencyId]);

  const loadProfile = async (agencyId: string) => {
    if (!user?.email) return;
    diagnostics.incrementFirestore('getResellerByEmail', user.email);
    const data = await resellerService.getResellerByEmail(user.email, agencyId);
    setProfile(data);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="relative overflow-hidden bg-slate-900 border border-slate-800 rounded-[32px] p-8 shadow-2xl">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] -mr-32 -mt-32" />
      
      <div className="relative flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              <Wallet className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Reseller Treasury</h3>
              <p className="text-white font-mono text-sm font-bold uppercase">{profile?.name || 'Loading Account...'}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="text-4xl font-bold text-white tracking-tight flex items-baseline gap-2">
              <span className="text-emerald-500 text-xl">IDR</span>
              {profile ? profile.balance.toLocaleString('id-ID') : '0'}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                <div className="text-xs text-slate-600 font-bold uppercase tracking-tight mb-1">Frozen Funds</div>
                <div className="text-xs font-medium text-blue-400 font-bold">IDR {profile?.frozenBalance?.toLocaleString('id-ID') || '0'}</div>
              </div>
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                <div className="text-xs text-slate-600 font-bold uppercase tracking-tight mb-1">Pending Deposit</div>
                <div className="text-xs font-medium text-emerald-500/50 font-bold">IDR {profile?.pendingBalance?.toLocaleString('id-ID') || '0'}</div>
              </div>
            </div>

            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-3 h-3 text-emerald-500/50" />
              Verified liquidity node
            </p>
          </div>
        </div>

        <div className="flex gap-4 w-full md:w-auto">
          <button 
            onClick={() => setShowTopUp(true)}
            className="flex-1 md:flex-none px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all shadow-xl shadow-emerald-500/20 active:scale-95 flex items-center justify-center gap-3"
          >
            <Plus className="w-4 h-4" />
            Request Topup
          </button>
          
          <button className="flex-1 md:flex-none px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold text-xs uppercase tracking-wider transition-all border border-slate-800 flex items-center justify-center gap-3">
            <History className="w-4 h-4" />
            Log
          </button>
        </div>
      </div>

      {showTopUp && (
        <TopUpForm 
          onClose={() => setShowTopUp(false)} 
          resellerId={profile?.id || ''} 
          agencyId={profile?.agencyId || ''} 
        />
      )}
    </div>
  );
};
