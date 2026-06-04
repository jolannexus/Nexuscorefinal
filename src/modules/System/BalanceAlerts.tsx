import React, { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, RefreshCw } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { SectionHeader } from '../../components/ui/SectionHeader';

export const BalanceAlerts = () => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      const idToken = localStorage.getItem('nexus_auth_token');
      if (!idToken) return;

      const response = await fetch('/api/financial/integrity/alerts', {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setAlerts(Array.isArray(data) ? data : (Array.isArray(data?.alerts) ? data.alerts : []));
      }
    } catch (err) {
      
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 15000); // refresh every 15s
    return () => clearInterval(interval);
  }, []);

  const safeAlerts = Array.isArray(alerts) ? alerts : [];

  if (loading) {
    return (
      <Card className="border-white/5 bg-white/[0.01]/5 animate-pulse h-32 flex items-center justify-center">
        <RefreshCw className="w-4 h-4 text-slate-500 animate-spin mr-2" />
        <span className="text-xs text-slate-500 font-mono font-medium">Scanning ledger balances...</span>
      </Card>
    );
  }

  return (
    <Card className={`border-l-4 transition-all ${safeAlerts.length > 0 ? 'border-l-rose-500 border-rose-950/20 bg-rose-950/5' : 'border-l-emerald-500 border-white/5 bg-white/[0.01]'}`}>
      <SectionHeader 
        title="Ledger Balance Integration Diagnostics" 
        icon={safeAlerts.length > 0 ? ShieldAlert : ShieldCheck} 
        colorClass={safeAlerts.length > 0 ? 'text-rose-400 font-bold tracking-tight animate-pulse' : 'text-emerald-400'} 
      />
      <div className="space-y-3 mt-4">
        {safeAlerts.length === 0 ? (
          <div className="p-3.5 bg-emerald-500/5 rounded-xl border border-emerald-500/10 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <div>
              <p className="text-xs font-bold text-emerald-200 uppercase tracking-wider">PLATFORM STABLE</p>
              <p className="text-[10px] text-slate-400 font-mono">No ledger balance drift, journal disparity or audit leaks detected.</p>
            </div>
          </div>
        ) : (
          safeAlerts.map((alert) => (
            <div key={alert.id} className="p-3.5 bg-rose-500/5 rounded-xl border border-rose-500/15 flex items-start gap-3">
              <AlertTriangle className="w-4.5 h-4.5 text-rose-400 shrink-0 mt-0.5 animate-bounce" />
              <div className="space-y-1">
                <p className="text-xs font-bold text-rose-200 uppercase tracking-wider">DEVIATION DETECTED</p>
                <p className="text-[10px] text-slate-400 leading-normal font-medium">{alert.notes}</p>
                <div className="flex gap-2 text-[9px] font-mono mt-1 text-rose-400/80">
                  <span className="bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">Account: {alert.accountId.slice(0, 15)}...</span>
                  <span className="bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">Drift: IDR {Number(alert.driftAmount).toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};
