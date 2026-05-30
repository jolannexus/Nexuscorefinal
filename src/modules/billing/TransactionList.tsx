import React, { useState, useEffect } from 'react';
import { Transaction } from '../../types';
import { History, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../../utils/cn';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { diagnostics } from '../../utils/diagnostics';

import { authService } from '../../services/authService';
import { QRISPaymentValidator } from './QRISPaymentValidator';

export const TransactionList = () => {
  diagnostics.logRender('TransactionList');
  const { profile, role } = useAuth();
  
  // Replace with actual API call to /api/transactions
  const { data: transactions = [], isLoading: loading } = useQuery({
    queryKey: ['transactions', profile?.agencyId, profile?.uid],
    queryFn: async () => {
       const token = authService.getToken();
       const res = await fetch('/api/wallets/me/transactions', {
         headers: {
           'Authorization': `Bearer ${token}`
         }
       });
       if (!res.ok) throw new Error('Failed to fetch transactions');
       const data = await res.json();
       // Normalize date for display
       return data.map((t: any) => ({
         ...t,
         createdAt: { toDate: () => new Date(t.createdAt) }
       })) as Transaction[];
    },
    enabled: !!profile?.agencyId
  });

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {loading ? (
          <TableSkeleton rows={8} columns={3} />
        ) : transactions.length === 0 ? (
          <div className="p-6 md:p-12 text-center text-xs text-slate-500 font-medium bg-slate-900/50 border border-slate-800 rounded-3xl">
            No transactions found in this wallet.
          </div>
        ) : (
          transactions.map(t => {
            const isDebitLike = ['DEBIT', 'FREEZE', 'CONFIRM_DEBIT'].includes(t.type);
            const isCreditLike = ['CREDIT', 'UNFREEZE', 'DEPOSIT'].includes(t.type) || t.description?.toLowerCase().includes('deposit');
            
            return (
              <div key={t.id} className="flex items-center justify-between p-5 bg-slate-900 backdrop-blur-md rounded-2xl border border-slate-800 hover:border-primary/20 hover:bg-white/5 transition-all group">
                <div className="flex items-center gap-5">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center border",
                    isDebitLike ? "bg-red-500/10 border-red-500/20 text-red-500" : 
                    isCreditLike ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" :
                    "bg-blue-500/10 border-blue-500/20 text-blue-500"
                  )}>
                    {isDebitLike ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white uppercase tracking-tight leading-tight">{t.description}</div>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className={cn(
                        "text-xs px-1.5 py-0.5 rounded font-bold tracking-wider uppercase",
                        isDebitLike ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-500"
                      )}>{t.type}</span>
                      <span className="text-xs text-slate-500 font-mono">
                        {t.balanceBefore !== undefined && t.balanceAfter !== undefined && (
                          <span className="opacity-40">{formatAmount(t.balanceBefore)} → </span>
                        )}
                        <span className="text-slate-400 font-bold">{formatAmount(t.balanceAfter || 0)}</span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={cn(
                    "font-mono text-sm font-bold",
                    isDebitLike ? "text-red-500" : "text-emerald-500"
                  )}>
                    {isDebitLike ? '-' : '+'}{formatAmount(t.amount)}
                  </div>
                  {t.paymentMethod === 'QRIS' && t.status === 'PENDING' && (
                    <div className="mt-2 flex justify-end">
                      <QRISPaymentValidator depositId={t.id} />
                    </div>
                  )}
                  <div className="text-xs text-slate-600 font-mono mt-1 uppercase">
                    {t.createdAt?.toDate ? format(t.createdAt.toDate(), 'HH:mm // MMM dd') : 'SYNCING...'}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
