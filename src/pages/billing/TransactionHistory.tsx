import React from 'react';
import { Card } from '../../components/ui/Card';
import { TransactionList } from '../../modules/billing/TransactionList';
import { History, Search, Filter, Download } from 'lucide-react';
import { BRAND } from '../../config/branding';

export const TransactionHistoryPage = () => {
  return (
    <div className="space-y-8 max-w-7xl mx-auto py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-primary rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] text-slate-950">
              <History className="w-6 h-6" />
            </div>
            <h1 className="text-4xl font-bold text-white uppercase tracking-tight leading-none">
              Transaction Logs
            </h1>
          </div>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider flex items-center gap-2">
            Immutable Ledger Documentation // 
          </p>
        </div>

        <div className="flex gap-4">
          <button className="vortex-button-secondary flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filter Stream
          </button>
          <button className="vortex-button-primary flex items-center gap-2">
            <Download className="w-4 h-4 text-slate-950" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <Card className="h-full">
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
              <input 
                type="text"
                placeholder="Search by Transaction ID, Reseller, or Product..."
                className="vortex-input pl-12 h-14"
              />
            </div>
            <TransactionList />
          </Card>
        </div>

        <div className="space-y-6 text-slate-400">
          <Card title="Ledger Summary" subtitle="Current Cycle Data">
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Gross Inflow</span>
                <span className="text-sm font-medium font-bold text-slate-400">SYNCING...</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Gross Outflow</span>
                <span className="text-sm font-medium font-bold text-slate-400">SYNCING...</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Net Variance</span>
                <span className="text-sm font-medium font-bold text-primary">---</span>
              </div>
            </div>
          </Card>

          <Card title="Security Log" subtitle="Financial Integrity">
            <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider leading-relaxed">
                All transactions dynamically verified. No anomalies detected in current batch.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
