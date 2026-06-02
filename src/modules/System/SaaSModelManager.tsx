import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Briefcase, CreditCard, Check, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';

export const SaaSModelManager = () => {
  const { user } = useAuth();
  const { tenant } = useTenant();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [operationMode, setOperationMode] = useState<'MANAGED_DEPOSIT' | 'BYO_SUPPLIER'>('MANAGED_DEPOSIT');

  useEffect(() => {
    if (tenant?.operationMode) {
      setOperationMode(tenant.operationMode);
    }
  }, [tenant]);

  const handleUpdateMode = async (mode: 'MANAGED_DEPOSIT' | 'BYO_SUPPLIER') => {
    if (!tenant) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/tenants/${tenant.id}/operation-mode`, {
         method: 'PUT',
         headers: {
           'Content-Type': 'application/json',
           'Authorization': `Bearer ${user?.uid}`
         },
         body: JSON.stringify({ operationMode: mode })
      });
      if (response.ok) {
         setOperationMode(mode);
         alert('Operation Mode updated successfully. Reloading...');
         window.location.reload();
      } else {
         const data = await response.json();
         alert(data.error || 'Failed to update operation mode');
      }
    } catch (e) {
      setError('Gagal memuat konfigurasi SaaS model.');
      alert('Error updating mode');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
          <Briefcase className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-white tracking-wide">Operation Mode</h2>
          <p className="text-[11px] text-slate-400">Configure how your agency handles suppliers and deposits</p>
        </div>
      </div>

      <div className="space-y-4">
        <label 
          className={`flex items-start p-4 border rounded-xl cursor-pointer transition-all ${
            operationMode === 'MANAGED_DEPOSIT' ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-white/5 border-white/10 hover:border-white/20'
          }`}
        >
          <input 
            type="radio" 
            name="operationMode" 
            value="MANAGED_DEPOSIT" 
            checked={operationMode === 'MANAGED_DEPOSIT'}
            onChange={() => handleUpdateMode('MANAGED_DEPOSIT')}
            disabled={loading}
            className="mt-1 mr-3" 
          />
          <div className="flex-1">
            <h3 className="text-xs font-bold text-white mb-1">Managed Deposit</h3>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Use the Master Agency's supplier API limits and deposit pool. 
              You must deposit funds to the Master Agency to process transactions.
            </p>
          </div>
        </label>

        <label 
          className={`flex items-start p-4 border rounded-xl cursor-pointer transition-all ${
            operationMode === 'BYO_SUPPLIER' ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-white/5 border-white/10 hover:border-white/20'
          }`}
        >
          <input 
            type="radio" 
            name="operationMode" 
            value="BYO_SUPPLIER" 
            checked={operationMode === 'BYO_SUPPLIER'}
            onChange={() => handleUpdateMode('BYO_SUPPLIER')}
            disabled={loading}
            className="mt-1 mr-3" 
          />
          <div className="flex-1">
            <h3 className="text-xs font-bold text-white mb-1">SaaS Model (BYO Supplier/Pure Subscription)</h3>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Pay a fixed monthly subscription to the Master. You operate without depositing to the Master.
              Bring your own Supplier API keys or configure direct supplier post-payments.
            </p>
          </div>
        </label>
      </div>
      
      {operationMode === 'BYO_SUPPLIER' && (
         <div className="mt-6 p-4 bg-[#0a0a0a] rounded-xl border border-white/5">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-white">Active Subscription</span>
            </div>
            <div className="flex justify-between items-center mb-4">
               <div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-1">Plan</div>
                  <div className="text-sm text-white font-medium">Agency Pro (IDR 500k/mo)</div>
               </div>
               <div className="text-right">
                  <div className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-1">Status</div>
                  <div className="text-xs text-emerald-400 font-bold bg-emerald-400/10 px-2 py-0.5 rounded-lg">ACTIVE</div>
               </div>
            </div>
            <button className="w-full py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold transition-all">
              Manage Billing
            </button>
         </div>
      )}
    </Card>
  );
};
