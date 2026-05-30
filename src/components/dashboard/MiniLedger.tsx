import React from 'react';
import { Card } from '../ui/Card';
import { ArrowUpRight, ArrowDownRight, History } from 'lucide-react';
import { Transaction } from '../../types';
import { cn } from '../../utils/cn';
import { useNavigate } from 'react-router-dom';

interface MiniLedgerProps {
  transactions: Transaction[];
  limit?: number;
}

export const MiniLedger: React.FC<MiniLedgerProps> = ({ transactions, limit = 5 }) => {
  const navigate = useNavigate();
  const displayTx = transactions.slice(0, limit);

  return (
    <Card title="Mini Ledger" subtitle="Latest wallet activities">
      <div className="space-y-3 mt-4">
        {displayTx.map((tx) => {
          const isCredit = ['CREDIT', 'DEPOSIT', 'REFUND', 'UNFREEZE'].includes(tx.type);
          const isDebit = ['DEBIT', 'PURCHASE', 'FREEZE', 'CONFIRM_DEBIT', 'TRANSFER'].includes(tx.type);

          return (
            <div 
              key={tx.id} 
              className="p-3 bg-[#0a0a0a] border border-white/5 rounded-xl flex items-center justify-between hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-9 h-9 flex-shrink-0 rounded-lg flex items-center justify-center border",
                  isCredit ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                  isDebit ? "bg-rose-500/10 border-rose-500/20 text-rose-400" :
                  "bg-slate-500/10 border-slate-500/20 text-slate-400"
                )}>
                  {isCredit ? <ArrowDownRight className="w-4 h-4" /> : 
                   isDebit ? <ArrowUpRight className="w-4 h-4" /> : 
                   <History className="w-4 h-4" />}
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-white tracking-tight leading-none mb-1.5 line-clamp-1">{tx.description || tx.type}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold tracking-widest">{tx.type}</span>
                    {tx.status && (
                      <>
                        <span className="text-slate-700">•</span>
                        <span className={cn(
                          "text-[9px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded flex items-center gap-1.5",
                          tx.status === 'COMPLETED' ? "bg-emerald-500/10 text-emerald-400" :
                          tx.status === 'PENDING' ? "bg-amber-500/10 text-amber-400" :
                          "bg-rose-500/10 text-rose-400"
                        )}>
                          {tx.status === 'COMPLETED' && (
                            <span className="relative flex h-1.5 w-1.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                            </span>
                          )}
                          {tx.status}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right flex flex-col justify-center flex-shrink-0 ml-4">
                <p className={cn(
                  "text-sm font-semibold tracking-tight font-mono",
                  isCredit ? "text-emerald-400" : 
                  isDebit ? "text-rose-400" : "text-white"
                )}>
                  {isCredit ? '+' : isDebit ? '-' : ''}IDR {tx.amount.toLocaleString('id-ID')}
                </p>
                {tx.balanceAfter !== undefined && (
                  <p className="text-[10px] text-slate-500 font-mono mt-1">
                    Bal: IDR {tx.balanceAfter.toLocaleString('id-ID')}
                  </p>
                )}
              </div>
            </div>
          );
        })}

        {displayTx.length === 0 && (
          <div className="text-center py-8 border border-dashed border-white/10 rounded-xl">
             <History className="w-6 h-6 text-slate-600 mx-auto mb-2" />
             <p className="text-xs text-slate-500 font-medium tracking-wide">No transactions recorded yet</p>
          </div>
        )}
      </div>
      
      <button 
        onClick={() => navigate('/history')} 
        className="w-full mt-4 py-2 bg-transparent border border-white/5 rounded-lg text-xs font-semibold text-slate-400 hover:bg-white/5 hover:text-white transition-all flex items-center justify-center gap-2"
      >
        <History className="w-3.5 h-3.5" />
        View Full Ledger
      </button>
    </Card>
  );
};
