import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { Activity, RefreshCw, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ReconciliationRecord {
  id: string;
  tenantId: string;
  journalId: string;
  status: 'MATCHED' | 'DISCREPANCY' | 'RESOLVED';
  expectedAmount: number;
  actualAmount: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  journal: {
    id: string;
    type: string;
    description: string;
  };
}

export const LedgerDriftMonitor = () => {
  const [records, setRecords] = useState<ReconciliationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Reconcile Override states
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [justification, setJustification] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = async () => {
    setIsLoading(true);
    try {
      const idToken = localStorage.getItem('nexus_auth_token');
      if (!idToken) return;

      const response = await fetch('/api/reconciliation/records', {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setRecords(Array.isArray(data) ? data : (Array.isArray(data?.records) ? data.records : []));
      }
    } catch (err) {
      
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
    const interval = setInterval(fetchRecords, 10000); // Polling every 10s
    return () => clearInterval(interval);
  }, []);

  const handleInitiateReconcile = (recordId: string) => {
    setSelectedRecordId(recordId);
    setJustification('');
    setError(null);
  };

  const handleConfirmReconcile = async () => {
    if (!selectedRecordId || !justification.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const idToken = localStorage.getItem('nexus_auth_token');
      if (!idToken) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch('/api/reconciliation/force-reconcile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          recordId: selectedRecordId,
          notes: justification
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reconcile record');
      }

      await fetchRecords();
      setSelectedRecordId(null);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during override');
    } finally {
      setIsSubmitting(false);
    }
  };

  const safeRecords = Array.isArray(records) ? records : [];
  const discrepancyCount = safeRecords.filter(r => r.status === 'DISCREPANCY').length;

  return (
    <Card className="border-slate-800 bg-slate-950">
      <div className="flex items-center justify-between mb-4">
        <SectionHeader title="Ledger Drift Monitor" icon={Activity} colorClass="text-emerald-400" />
        <div className="flex items-center gap-2">
          {discrepancyCount > 0 && (
            <span className="px-2 py-1 text-[10px] font-bold tracking-wider text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded uppercase flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              {discrepancyCount} Unresolved
            </span>
          )}
          <button
            onClick={fetchRecords}
            disabled={isLoading}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-md transition-colors disabled:opacity-50"
          >
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {safeRecords.length === 0 ? (
          <div className="text-center py-8 border border-white/5 bg-white/5 rounded-xl border-dashed">
            <CheckCircle className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider">No Reconciliation Records</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="pb-2">Time</th>
                  <th className="pb-2">Journal / Type</th>
                  <th className="pb-2 text-right">Expected</th>
                  <th className="pb-2 text-right">Actual</th>
                  <th className="pb-2 text-right">Drift</th>
                  <th className="pb-2 text-center">Status</th>
                  <th className="pb-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {safeRecords.map((record) => {
                  const drift = Number(record.actualAmount) - Number(record.expectedAmount);
                  return (
                    <tr key={record.id} className="text-[10px] hover:bg-white/5 group">
                      <td className="py-2.5 whitespace-nowrap text-slate-400 font-mono flex items-center gap-1.5">
                        <Clock className="w-3 h-3" />
                        {new Date(record.createdAt).toLocaleTimeString()}
                      </td>
                      <td className="py-2.5">
                        <div className="font-mono text-slate-300">
                           {record.journal.type}
                        </div>
                        <div className="text-slate-500 truncate max-w-[150px]" title={record.journal.description}>
                          {record.journal.description}
                        </div>
                        {record.notes && (
                          <div className="text-[9px] text-slate-500 italic mt-0.5 truncate max-w-[150px]" title={record.notes}>
                            Note: {record.notes}
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 text-right font-mono text-slate-300">
                        {Number(record.expectedAmount).toLocaleString()}
                      </td>
                      <td className="py-2.5 text-right font-mono text-slate-300">
                        {Number(record.actualAmount).toLocaleString()}
                      </td>
                      <td className={cn(
                        "py-2.5 text-right font-mono font-bold",
                        drift === 0 ? "text-slate-500" : drift > 0 ? "text-emerald-400" : "text-rose-400"
                      )}>
                        {drift > 0 ? '+' : ''}{drift.toLocaleString()}
                      </td>
                      <td className="py-2.5 text-center">
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border inline-block",
                          record.status === 'MATCHED' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                          record.status === 'DISCREPANCY' ? "bg-rose-500/10 text-rose-400 border-rose-500/20 animate-pulse" :
                          "bg-blue-500/10 text-blue-400 border-blue-500/20"
                        )}>
                          {record.status}
                        </span>
                      </td>
                      <td className="py-2.5 text-center">
                        {record.status === 'DISCREPANCY' ? (
                          <button
                            onClick={() => handleInitiateReconcile(record.id)}
                            className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-600 border border-rose-500/20 hover:border-transparent rounded transition-all cursor-pointer"
                          >
                            Force Reconcile
                          </button>
                        ) : (
                          <span className="text-slate-600 font-mono">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedRecordId && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl relative">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              Force Reconcile Asset Account
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              This action will automatically generate a corrective Ledger Journal Entry to balance the detected drift and align actual vs expected values.
            </p>

            {error && (
              <div className="mb-4 p-2.5 bg-rose-500/10 border border-rose-500/20 rounded text-xs text-rose-400 font-medium">
                {error}
              </div>
            )}

            <div className="space-y-3">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Audit Justification Note <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                placeholder="Submit professional audit comment explaining why this reconciliation is being manual-overridden..."
                className="w-full h-24 bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-700 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setSelectedRecordId(null)}
                disabled={isSubmitting}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold uppercase tracking-wider text-slate-300 rounded-lg border border-slate-700 transition-colors disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReconcile}
                disabled={isSubmitting || !justification.trim()}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:bg-rose-800 disabled:text-slate-500 text-xs font-bold uppercase tracking-wider text-white rounded-lg border border-rose-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    Overriding...
                  </>
                ) : (
                  'Confirm Override'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
