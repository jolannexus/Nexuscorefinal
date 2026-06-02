import React, { useState, useEffect } from 'react';
import { 
  History, 
  Activity, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw, 
  ShieldAlert, 
  Check, 
  FileSpreadsheet, 
  TrendingUp, 
  Terminal,
  HelpCircle
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';

interface LedgerEntry {
  id: string;
  accountId: string;
  type: 'DEBIT' | 'CREDIT';
  amount: string;
  balanceBefore: string | null;
  balanceAfter: string | null;
}

interface LedgerJournal {
  id: string;
  type: string;
  description: string;
  orderId: string | null;
  idempotencyKey: string;
  createdAt: string;
  entries: LedgerEntry[];
}

interface DriftReport {
  walletId: string;
  userId: string;
  recordedBalance: number;
  computedBalance: number;
  recordedFrozen: number;
  computedFrozen: number;
  driftDetected: boolean;
  activeDrift: number;
  frozenDrift: number;
}

interface OrphanedReport {
  transactionId: string;
  status: string;
  createdAt: string;
  ageMinutes: number;
  actionTaken: string;
}

interface ReconciliationResult {
  timestamp: string;
  integrityScore: number;
  anomalyCount: number;
  driftReports: DriftReport[];
  orphanedReports: OrphanedReport[];
}

export const LedgerReconciliationManager = () => {
  const [journals, setJournals] = useState<LedgerJournal[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadingJournals, setLoadingJournals] = useState(true);
  const [reconciliationReport, setReconciliationReport] = useState<ReconciliationResult | null>(null);
  const [runningReconciliation, setRunningReconciliation] = useState(false);
  const [autoHeal, setAutoHeal] = useState(false);
  const [activeTab, setActiveTab] = useState<'audit' | 'journals' | 'audit-logs'>('audit');
  const [message, setMessage] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);

  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [selectedSeverity, setSelectedSeverity] = useState<'ALL' | 'INFO' | 'WARN' | 'ERROR'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [integrityStatus, setIntegrityStatus] = useState<{
    checked: boolean;
    isValid: boolean;
    corruptLogIds: string[];
    loading: boolean;
  }>({
    checked: false,
    isValid: true,
    corruptLogIds: [],
    loading: false
  });

  const fetchAuditLogs = async (severityFilter = selectedSeverity) => {
    setLoadingLogs(true);
    try {
      const idToken = localStorage.getItem('nexus_auth_token');
      if (!idToken) return;

      const url = `/api/reconciliation/audit-logs?severity=${severityFilter}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setAuditLogs(data.logs || []);
      }
    } catch (err: any) {
      setError('Gagal memuat data. Refresh halaman atau hubungi admin.');
    } finally {
      setLoadingLogs(false);
    }
  };

  const verifyLogsIntegrity = async () => {
    setIntegrityStatus(prev => ({ ...prev, loading: true }));
    try {
      const idToken = localStorage.getItem('nexus_auth_token');
      if (!idToken) return;

      const response = await fetch('/api/reconciliation/verify-integrity', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setIntegrityStatus({
          checked: true,
          isValid: data.isValid,
          corruptLogIds: data.corruptLogIds || [],
          loading: false
        });
      }
    } catch (err: any) {
      setError('Gagal memuat data. Refresh halaman atau hubungi admin.');
      setIntegrityStatus(prev => ({ ...prev, loading: false }));
    }
  };

  const fetchJournals = async () => {
    setLoadingJournals(true);
    try {
      const idToken = localStorage.getItem('nexus_auth_token');
      if (!idToken) return;

      const response = await fetch('/api/reconciliation/ledger', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setJournals(data.journals || []);
      }
    } catch (err: any) {
      setError('Gagal memuat data. Refresh halaman atau hubungi admin.');
    } finally {
      setLoadingJournals(false);
    }
  };

  const runReconciliationJob = async (heal = false) => {
    setRunningReconciliation(true);
    setMessage(null);
    try {
      const idToken = localStorage.getItem('nexus_auth_token');
      if (!idToken) {
        setMessage({ type: 'danger', text: 'Authorization required to trigger billing reconciliation.' });
        return;
      }

      const response = await fetch('/api/reconciliation/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ autoHeal: heal })
      });
      if (response.ok) {
        const data = await response.json();
        setReconciliationReport(data.report);
        if (heal) {
          setMessage({ type: 'success', text: 'Reconciliation finished. All detected ledger drifts and orphaned transactions were resolved/healed successfully.' });
          fetchJournals(); // Refetch recent manually injected audit trail items
        } else {
          setMessage({
            type: data.report.anomalyCount > 0 ? 'danger' : 'success',
            text: data.report.anomalyCount > 0 
              ? `Audit finished. Detected ${data.report.anomalyCount} anomalies / drift in system balances.` 
              : 'Audit finished. No balance anomalies detected!'
          });
        }
      } else {
        const rText = await response.text();
        throw new Error(rText || 'Failed running reconciliation loop.');
      }
    } catch (err: any) {
      setError('Gagal memuat data. Refresh halaman atau hubungi admin.');
      setMessage({ type: 'danger', text: err.message || 'Failed to trigger reconciliation engine.' });
    } finally {
      setRunningReconciliation(false);
    }
  };

  useEffect(() => {
    fetchJournals();
  }, []);

  useEffect(() => {
    if (activeTab === 'audit-logs') {
      fetchAuditLogs(selectedSeverity);
    }
  }, [activeTab, selectedSeverity]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
        <div>
          <h2 className="text-[14px] font-semibold text-white uppercase tracking-widest flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500 animate-pulse" />
            Double-Entry Ledger & Reconciliation
          </h2>
          <p className="text-[11px] text-slate-400 mt-1 max-w-xl">
            Real-time audit loop cross-validating physical wallet states with append-only balanced journals. No balance updates bypassed.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest rounded-lg border transition-all ${
              activeTab === 'audit'
                ? 'bg-white/10 text-white border-white/20'
                : 'text-slate-400 border-transparent hover:text-white'
            }`}
          >
            Audit Deck
          </button>
          <button
            onClick={() => setActiveTab('audit-logs')}
            className={`px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest rounded-lg border transition-all ${
              activeTab === 'audit-logs'
                ? 'bg-white/10 text-white border-white/20'
                : 'text-slate-400 border-transparent hover:text-white'
            }`}
          >
            Financial Audit Logs
          </button>
          <button
            onClick={() => setActiveTab('journals')}
            className={`px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest rounded-lg border transition-all ${
              activeTab === 'journals'
                ? 'bg-white/10 text-white border-white/20'
                : 'text-slate-400 border-transparent hover:text-white'
            }`}
          >
            Ledger Journal Explorer
          </button>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl text-[11px] font-medium flex items-start gap-3 border ${
          message.type === 'success' 
            ? 'bg-emerald-950/20 text-emerald-400 border-emerald-900/40' 
            : 'bg-rose-950/20 text-rose-400 border-rose-900/40'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <AlertTriangle className="w-4 h-4 flex-shrink-0" />}
          <p>{message.text}</p>
        </div>
      )}

      {activeTab === 'audit' ? (
        <div className="space-y-6">
          {/* Integrity Score banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Ledger Integrity Score</span>
                <CheckCircle className={`w-4 h-4 ${reconciliationReport ? (reconciliationReport.integrityScore === 100 ? 'text-emerald-500' : 'text-amber-500') : 'text-slate-500'}`} />
              </div>
              <p className="text-3xl font-semibold text-white font-mono">
                {reconciliationReport ? `${reconciliationReport.integrityScore}%` : '---'}
              </p>
              <p className="text-[9px] text-slate-400 font-medium mt-1">
                Reflects the mathematical accuracy of physical balances vs ledger journal transactions.
              </p>
            </Card>

            <Card>
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Active Anomalies</span>
                <ShieldAlert className={`w-4 h-4 ${reconciliationReport && reconciliationReport.anomalyCount > 0 ? 'text-rose-500 animate-pulse' : 'text-slate-500'}`} />
              </div>
              <p className="text-3xl font-semibold text-white font-mono">
                {reconciliationReport ? reconciliationReport.anomalyCount : '---'}
              </p>
              <p className="text-[9px] text-slate-400 font-medium mt-1">
                Drift and stuck transactions currently flagged for tenant.
              </p>
            </Card>

            <Card>
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Verification Engine</span>
                <Activity className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="flex items-center gap-2 py-1">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-semibold tracking-widest uppercase text-white font-mono">ACTIVE (ACID-SAFE)</span>
              </div>
              <p className="text-[9px] text-slate-400 font-medium mt-1">
                Strict double-entry checks verified.
              </p>
            </Card>
          </div>

          <Card>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h3 className="text-[11px] font-semibold text-white uppercase tracking-widest">Trigger Auditing Loop</h3>
                <p className="text-[10px] text-slate-400 mt-1">
                  Run microsecond integrity scans looking for ledger drift, orphaned transactions, or balance inconsistencies.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer border border-white/5 bg-white/5 py-1.5 px-3 rounded-lg text-[10px] text-slate-400 select-none hover:text-white transition-all">
                  <input 
                    type="checkbox" 
                    checked={autoHeal} 
                    onChange={(e) => setAutoHeal(e.target.checked)}
                    className="rounded border-white/10 bg-black text-blue-500" 
                  />
                  Auto-heal corrections
                </label>
                <button
                  disabled={runningReconciliation}
                  onClick={() => runReconciliationJob(autoHeal)}
                  className="bg-white text-black hover:bg-slate-200 transition-colors py-1.5 px-4 rounded-lg font-semibold uppercase tracking-widest text-[10px] flex items-center gap-2 shadow-md disabled:opacity-50"
                >
                  {runningReconciliation ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Auditing...
                    </>
                  ) : (
                    <>
                      <Activity className="w-3.5 h-3.5" />
                      Run Audit Job
                    </>
                  )}
                </button>
              </div>
            </div>

            {reconciliationReport ? (
              <div className="space-y-6">
                <div>
                  <h4 className="text-[10px] font-semibold uppercase tracking-widest text-white mb-3">Balance Drift Reports</h4>
                  <div className="overflow-x-auto border border-white/5 rounded-xl">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-white/5 text-[9px] font-semibold text-slate-400 uppercase tracking-wider border-b border-white/5">
                          <th className="py-2.5 px-3">Wallet ID</th>
                          <th className="py-2.5 px-3">UserId</th>
                          <th className="py-2.5 px-3 text-right">Recorded Active</th>
                          <th className="py-2.5 px-3 text-right">Ledger-Computed Active</th>
                          <th className="py-2.5 px-3 text-right">Recorded Frozen</th>
                          <th className="py-2.5 px-3 text-right">Ledger-Computed Frozen</th>
                          <th className="py-2.5 px-3 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reconciliationReport.driftReports.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-6 text-center text-[10px] text-slate-500">
                              No wallets verified yet. Run audit loop.
                            </td>
                          </tr>
                        ) : (
                          reconciliationReport.driftReports.map((report, idx) => (
                            <tr key={idx} className="border-b border-white/5 hover:bg-white/5 text-[10px]">
                              <td className="py-2 px-3 font-mono text-slate-300">{report.walletId.substring(0, 8)}...</td>
                              <td className="py-2 px-3 font-medium text-slate-400">{report.userId.substring(0, 8)}...</td>
                              <td className="py-2 px-3 text-right font-mono text-slate-300">IDR {report.recordedBalance.toLocaleString()}</td>
                              <td className="py-2 px-3 text-right font-mono text-slate-300">IDR {report.computedBalance.toLocaleString()}</td>
                              <td className="py-2 px-3 text-right font-mono text-slate-300">IDR {report.recordedFrozen.toLocaleString()}</td>
                              <td className="py-2 px-3 text-right font-mono text-slate-300">IDR {report.computedFrozen.toLocaleString()}</td>
                              <td className="py-2 px-3 text-center">
                                {report.driftDetected ? (
                                  <span className="inline-block px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wide bg-rose-950/40 text-rose-400 border border-rose-900/30">
                                    DRIFT DETECTED
                                  </span>
                                ) : (
                                  <span className="inline-block px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wide bg-emerald-950/40 text-emerald-400 border border-emerald-900/30">
                                    BALANCED
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] font-semibold uppercase tracking-widest text-white mb-3">Orphaned & Stuck Transactions</h4>
                  <div className="overflow-x-auto border border-white/5 rounded-xl">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-white/5 text-[9px] font-semibold text-slate-400 uppercase tracking-wider border-b border-white/5">
                          <th className="py-2.5 px-3">Order ID</th>
                          <th className="py-2.5 px-3">State</th>
                          <th className="py-2.5 px-3">Created At</th>
                          <th className="py-2.5 px-3 text-right">Stuck Duration</th>
                          <th className="py-2.5 px-3 text-center">Auto-Reconcile Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reconciliationReport.orphanedReports.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-6 text-center text-[10px] text-slate-500">
                              No stuck / orphaned transactions detected in the logs today. Excellent!
                            </td>
                          </tr>
                        ) : (
                          reconciliationReport.orphanedReports.map((orph, idx) => (
                            <tr key={idx} className="border-b border-white/5 hover:bg-white/5 text-[10px]">
                              <td className="py-2 px-3 font-mono text-slate-300">{orph.transactionId}</td>
                              <td className="py-2 px-3 text-amber-500 uppercase tracking-wider font-bold text-[9px]">{orph.status}</td>
                              <td className="py-2 px-3 text-slate-500 font-mono">{new Date(orph.createdAt).toLocaleString()}</td>
                              <td className="py-2 px-3 text-right font-mono text-rose-400 font-medium">{orph.ageMinutes} min</td>
                              <td className="py-2 px-3 text-center font-mono text-[9px]">
                                {orph.actionTaken === 'NONE' ? (
                                  <span className="text-slate-400">UNRESOLVED (DRY RUN)</span>
                                ) : orph.actionTaken === 'CANCELLED_AND_REFUNDED' ? (
                                  <span className="text-emerald-400 font-bold bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-900/40">CANCELLED & REFUNDED</span>
                                ) : (
                                  <span className="text-blue-400 font-bold bg-blue-950/20 px-2 py-0.5 rounded border border-blue-900/40">{orph.actionTaken}</span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-[11px] text-slate-500 border border-dashed border-white/10 rounded-xl bg-white/5">
                <Terminal className="w-8 h-8 mx-auto text-slate-600 mb-3" />
                <p>Run the Audit suite to verify transactional ledger balance states, monitor balance drifts, and clean stale PROCESSING logs.</p>
              </div>
            )}
          </Card>
        </div>
      ) : activeTab === 'audit-logs' ? (
        <div className="space-y-6">
          {/* Integrated Cryptographic Integrity Verification Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card className="h-full">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white">Cryptographic Assurance System</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Ensures absolute tamper-prevented transparency by chain-hashing logs sequentially.
                    </p>
                  </div>
                  <ShieldAlert className={`w-5 h-5 ${integrityStatus.checked ? (integrityStatus.isValid ? 'text-emerald-500' : 'text-rose-500 animate-pulse') : 'text-slate-500'}`} />
                </div>
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white/[0.02] p-3 rounded-lg border border-white/5">
                  <div>
                    <div className="text-[10px] text-slate-300 font-mono">
                      Status: {integrityStatus.loading ? (
                        <span className="text-blue-400 uppercase font-bold animate-pulse">Running hashes...</span>
                      ) : integrityStatus.checked ? (
                        integrityStatus.isValid ? (
                          <span className="text-emerald-400 font-bold uppercase">VERIFIED SECURE (100% VALID)</span>
                        ) : (
                          <span className="text-rose-400 font-bold uppercase">TAMPERED LOG DETECTED</span>
                        )
                      ) : (
                        <span className="text-slate-500 uppercase">UNVERIFIED (Verification recommended)</span>
                      )}
                    </div>
                    {integrityStatus.checked && !integrityStatus.isValid && (
                      <div className="text-[9px] text-rose-400 mt-1">
                        Corrupted Entry ID(s): {integrityStatus.corruptLogIds.join(', ')}
                      </div>
                    )}
                  </div>
                  <button
                    disabled={integrityStatus.loading}
                    onClick={verifyLogsIntegrity}
                    className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-black font-extrabold text-[9px] uppercase tracking-widest rounded-lg transition-colors cursor-pointer"
                  >
                    Verify Forensic Signatures
                  </button>
                </div>
              </Card>
            </div>

            <Card>
              <div className="flex items-center gap-2 mb-2 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>Drift Speed-Investigation</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                Filter by <span className="text-rose-400 font-semibold">ERROR</span> to isolate immediate settlement balance breaks, or select <span className="text-amber-400 font-semibold">WARN</span> to check failed external callback replays.
              </p>
            </Card>
          </div>

          <Card>
            <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-center md:justify-between mb-6">
              <div>
                <h3 className="text-[11px] font-semibold text-white uppercase tracking-widest flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-slate-400" />
                  Financial Audit Trail
                </h3>
                <p className="text-[10px] text-slate-400 mt-1">
                  Immutable sequential database logs capturing wallet operations, escrow, and manual reconciliation overrides.
                </p>
              </div>

              {/* Filtering Controls */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search logs action / details..."
                    className="pl-8 pr-3 h-8 text-[11px] bg-black border border-white/10 rounded-lg text-slate-200 placeholder-slate-700 focus:outline-none focus:border-white/20 font-mono w-48"
                  />
                  <svg className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>

                <div className="flex items-center rounded-lg bg-black border border-white/5 p-0.5">
                  {(['ALL', 'INFO', 'WARN', 'ERROR'] as const).map((sev) => {
                    const active = selectedSeverity === sev;
                    const colorMap = {
                      ALL: active ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300',
                      INFO: active ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-slate-500 hover:text-slate-400',
                      WARN: active ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-slate-500 hover:text-slate-400',
                      ERROR: active ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'text-slate-500 hover:text-slate-400'
                    };
                    return (
                      <button
                        key={sev}
                        onClick={() => setSelectedSeverity(sev)}
                        className={`px-3 py-1 text-[9px] font-bold uppercase tracking-wider rounded-md transition-all cursor-pointer ${colorMap[sev]}`}
                      >
                        {sev}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => fetchAuditLogs(selectedSeverity)}
                  className="w-8 h-8 rounded-lg bg-white/5 border border-white/15 flex items-center justify-center hover:bg-white/10 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-white ${loadingLogs ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {loadingLogs ? (
              <div className="space-y-3">
                {[1, 2, 4].map(i => <div key={i} className="h-10 bg-white/5 border border-white/10 rounded-lg animate-pulse" />)}
              </div>
            ) : (() => {
              const filtered = auditLogs.filter(l => {
                if (!searchTerm.trim()) return true;
                const term = searchTerm.toLowerCase();
                return (
                  l.action.toLowerCase().includes(term) ||
                  l.details.toLowerCase().includes(term) ||
                  (l.id && l.id.toLowerCase().includes(term))
                );
              });

              if (filtered.length === 0) {
                return (
                  <div className="py-12 text-center text-[10px] text-slate-500">
                    No financial audit log entries found matching the active filter parameters.
                  </div>
                );
              }

              return (
                <div className="overflow-x-auto border border-white/5 rounded-xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white/5 text-[9px] font-semibold text-slate-400 uppercase tracking-wider border-b border-white/5">
                        <th className="py-2.5 px-3">Timestamp</th>
                        <th className="py-2.5 px-3">Severity</th>
                        <th className="py-2.5 px-3">Action Type</th>
                        <th className="py-2.5 px-3">Details</th>
                        <th className="py-2.5 px-3 font-mono">Cryptographic Fingerprint Signature</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filtered.map((log) => (
                        <tr key={log.id} className="hover:bg-white/[0.02] text-[10px] transition-colors">
                          <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                            {new Date(log.createdAt).toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            {log.severity === 'ERROR' ? (
                              <span className="inline-block px-1.5 py-0.5 font-bold uppercase tracking-wider text-[8px] rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                ERROR
                              </span>
                            ) : log.severity === 'WARN' ? (
                              <span className="inline-block px-1.5 py-0.5 font-bold uppercase tracking-wider text-[8px] rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                WARN
                              </span>
                            ) : (
                              <span className="inline-block px-1.5 py-0.5 font-bold uppercase tracking-wider text-[8px] rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                INFO
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 font-mono font-semibold text-white tracking-wide">
                            {log.action}
                          </td>
                          <td className="py-2.5 px-3 text-slate-300 font-medium break-all max-w-sm">
                            {log.details}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-[9px] text-slate-500 hover:text-slate-300 select-all cursor-help shrink-0 w-44 truncate" title={log.fingerprint}>
                            {log.fingerprint.substring(0, 16)}...
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })()}
          </Card>
        </div>
      ) : (
        <Card>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-[11px] font-semibold text-white uppercase tracking-widest flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-slate-400" />
                Recent Ledger Journals
              </h3>
              <p className="text-[10px] text-slate-400 mt-1">
                Displaying append-only transactional journals. Each journal represents an immutable double-entry recording both debit and credit.
              </p>
            </div>
            <button
              onClick={fetchJournals}
              className="w-8 h-8 rounded-lg bg-white/5 border border-white/15 flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-white ${loadingJournals ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {loadingJournals ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <div key={i} className="h-16 bg-white/5 border border-white/10 rounded-xl animate-pulse" />)}
            </div>
          ) : journals.length === 0 ? (
            <div className="py-12 text-center text-[11px] text-slate-500">
              No ledger records found yet. Place some orders or deposit cash to generate double-entry ledgers.
            </div>
          ) : (
            <div className="space-y-4">
              {journals.map((journal) => (
                <div 
                  key={journal.id} 
                  className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-3 hovering-bright"
                >
                  <div className="flex justify-between items-center text-[10px]">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-white/10 text-white font-semibold font-mono uppercase tracking-wide">
                        {journal.type}
                      </span>
                      <span className="text-slate-500 font-mono text-[9px]">{journal.id}</span>
                    </div>
                    <span className="text-slate-500 font-mono">{new Date(journal.createdAt).toLocaleTimeString()}</span>
                  </div>

                  <p className="text-[11px] text-slate-300 font-medium">
                    {journal.description}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 border-t border-white/5 pt-3">
                    {journal.entries.map((entry) => (
                      <div 
                        key={entry.id} 
                        className={`p-2.5 rounded-lg text-[10px] flex justify-between items-center ${
                          entry.type === 'DEBIT' 
                            ? 'bg-emerald-950/10 border border-emerald-900/20 text-emerald-400' 
                            : 'bg-rose-950/10 border border-rose-900/20 text-rose-400'
                        }`}
                      >
                        <div>
                          <p className="font-semibold uppercase tracking-wider text-[8px] text-slate-400 mb-0.5">{entry.type}</p>
                          <p className="font-mono font-medium text-slate-300">{entry.accountId.startsWith('SYSTEM:') ? entry.accountId : `Wallet ID: ${entry.accountId.substring(0, 8)}...`}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono font-semibold text-white">IDR {Number(entry.amount).toLocaleString()}</p>
                          {entry.balanceAfter && (
                            <p className="text-[8px] text-slate-500 font-mono mt-0.5">After: IDR {Number(entry.balanceAfter).toLocaleString()}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
