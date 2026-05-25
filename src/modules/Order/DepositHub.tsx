import React, { useState, useEffect } from 'react';
import { Wallet, Check, X as XIcon, Clock } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { BillingService } from '../../services/billing/billingService';
import { Transaction } from '../../types/index';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../utils/cn';

export const DepositHub = () => {
  const { user, profile } = useAuth();
  const [deposits, setDeposits] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile?.agencyId) {
      loadDeposits();
    }
  }, [profile?.agencyId]);

  const loadDeposits = async () => {
    if (!profile?.agencyId) return;
    const data = await BillingService.getPendingDeposits(profile.agencyId);
    setDeposits(data);
  };

  const handleApprove = async (tx: Transaction) => {
    setLoading(true);
    try {
      await BillingService.approveDeposit(tx);
      await loadDeposits();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (tx: Transaction) => {
    setLoading(true);
    try {
      if (!tx.agencyId) throw new Error('Missing agencyId');
      await BillingService.rejectDeposit(tx.agencyId, tx.id);
      await loadDeposits();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Card className="border-emerald-900/40 bg-emerald-950/5 h-full">
      <SectionHeader title="Deposit Queue" icon={Wallet} colorClass="text-emerald-400" />
      
      <div className="space-y-3 mt-4 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
        {deposits.map((d) => (
          <div key={d.id} className="flex justify-between items-center p-3 bg-slate-950/50 rounded-2xl border border-slate-800 group hover:border-emerald-500/20 transition-all">
             <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-white uppercase tracking-tight truncate max-w-[120px]">
                  {d.resellerId.slice(-8)}
                </span>
                <div className="flex items-center gap-1.5 opacity-50">
                  <Clock className="w-2.5 h-2.5" />
                  <span className="text-xs text-slate-500 font-mono italic">
                    {d.paymentMethod} @ {d.createdAt?.seconds ? new Date(d.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'now'}
                  </span>
                </div>
             </div>
             
             <div className="flex flex-col items-end gap-2">
                <span className="text-xs font-medium font-bold text-emerald-400">
                  {formatAmount(d.amount)}
                </span>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button 
                     onClick={() => handleApprove(d)}
                     disabled={loading}
                     className="p-1.5 bg-emerald-600/20 text-emerald-500 hover:bg-emerald-600 hover:text-white rounded-lg transition-all"
                   >
                     <Check className="w-3 h-3" />
                   </button>
                   <button 
                     onClick={() => handleReject(d)}
                     disabled={loading}
                     className="p-1.5 bg-red-900/20 text-red-500 hover:bg-red-900 hover:text-white rounded-lg transition-all"
                   >
                     <XIcon className="w-3 h-3" />
                   </button>
                </div>
             </div>
          </div>
        ))}

        {deposits.length === 0 && (
          <div className="py-8 text-center bg-slate-950/30 rounded-2xl border border-dashed border-slate-800">
             <p className="text-xs text-slate-600 uppercase font-bold tracking-wider">Queue Clear</p>
          </div>
        )}
      </div>

      <p className="text-xs text-slate-700 text-center uppercase tracking-wider mt-4 font-mono">
        System Operational // Manual Verification Required
      </p>
    </Card>
  );
};
