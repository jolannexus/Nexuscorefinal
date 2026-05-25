import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { DepositHub as AdminDepositList } from '../../modules/Order/DepositHub';
import { Wallet, Plus, CreditCard, Banknote, Landmark, ShieldCheck, History, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../utils/cn';
import { BillingService } from '../../services/billing/billingService';

export const DepositSystemPage = () => {
  const { role, profile } = useAuth();
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('Bank Transfer');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.agencyId || !profile?.uid) return;
    
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount < 10000) {
      alert('Minimum deposit is IDR 10,000');
      return;
    }

    setLoading(true);
    try {
      await BillingService.requestDeposit({
        resellerId: profile.role === 'RESELLER' ? profile.uid : 'ADMIN_MANUAL',
        agencyId: profile.agencyId,
        amount: numAmount,
        paymentMethod: method
      });
      alert('Deposit request submitted for verification');
      setAmount('');
    } catch (err: any) {
      alert(err.message || 'Deposit submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-primary rounded-2xl shadow-lg text-slate-950">
              <Wallet className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight leading-none">
              Billing & Deposits
            </h1>
          </div>
          <p className="text-xs text-slate-500 font-medium tracking-wide">
            Manage your account balance and deposit history
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Deposit Form - For Resellers or Direct Add */}
        <div className="lg:col-span-1 space-y-6">
          <Card 
            title={role === 'AGENCY' ? 'Manual Adjustment' : 'Top-up Balance'} 
            subtitle="Add funds to your account"
          >
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">Amount (IDR)</label>
                <div className="relative group">
                  <Banknote className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-primary transition-colors" />
                  <input 
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Minimal IDR 10,000"
                    disabled={loading}
                    className="vortex-input pl-12"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">Payment Method</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'Bank Transfer', label: 'Bank Transfer', icon: Landmark },
                    { id: 'E-Wallet', label: 'E-Wallet', icon: CreditCard },
                    { id: 'QRIS', label: 'QRIS Scan', icon: ShieldCheck },
                    { id: 'Crypto', label: 'Crypto', icon: Banknote },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      disabled={loading}
                      onClick={() => setMethod(item.id)}
                      className={cn(
                        "flex flex-col items-center gap-2 p-4 rounded-3xl border transition-all",
                        method === item.id 
                          ? "bg-primary/10 border-primary text-primary" 
                          : "bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-800"
                      )}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="text-xs font-semibold">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="vortex-button-primary w-full h-14 flex items-center justify-center gap-3 text-sm font-bold uppercase tracking-wider"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                {loading ? 'Processing...' : 'Request Deposit'}
              </button>
            </form>
          </Card>

          <Card title="Security & Verification" subtitle="Payment protection">
             <div className="flex gap-4 items-start p-4 bg-primary/5 rounded-3xl border border-primary/10">
                <div className="p-2 bg-primary/10 rounded-xl shrink-0">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                </div>
                <div>
                   <p className="text-xs font-bold text-white mb-1">Manual Verification</p>
                   <p className="text-xs text-slate-500 font-medium leading-relaxed">
                     All deposits are verified by our billing team. Please provide a transfer receipt to expedite the processing of your request.
                   </p>
                </div>
             </div>
          </Card>
        </div>

        {/* Pending Queue - Primarily for Admins */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-4">
             <h2 className="text-xs font-bold text-white uppercase tracking-wider">Pending Requests</h2>
             <div className="h-px flex-1 bg-white/5" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AdminDepositList />
            <Card title="Recent History" subtitle="Verified transactions" accent>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="flex justify-between items-center py-2 border-b border-slate-800">
                       <div className="flex items-center gap-3">
                          <History className="w-3.5 h-3.5 text-slate-600" />
                          <div>
                             <p className="text-xs font-bold text-white tracking-tight">Deposit Request #{2450 + i}</p>
                             <p className="text-xs text-slate-500 font-medium">Completed • Today, 10:2{i} AM</p>
                          </div>
                       </div>
                       <span className="text-sm font-bold text-emerald-500">+IDR 500k</span>
                    </div>
                  ))}
                </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
