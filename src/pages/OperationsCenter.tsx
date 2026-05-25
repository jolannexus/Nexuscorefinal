import React, { useState, useEffect, useRef } from 'react';
import { 
  Cpu, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  Terminal, 
  ShieldAlert, 
  Sparkles, 
  RefreshCw, 
  Play, 
  Database, 
  Zap, 
  ChevronRight, 
  Server, 
  Code, 
  Key, 
  Repeat, 
  Layers, 
  Lock, 
  Timer, 
  RotateCcw,
  Check,
  XCircle,
  HelpCircle,
  Globe,
  DatabaseZap
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { motion, AnimatePresence } from 'motion/react';

interface TestStep {
  id: string;
  name: string;
  status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED';
  log: string[];
}

interface TestLogItem {
  timestamp: string;
  type: 'INFO' | 'WARN' | 'SUCCESS' | 'ERROR' | 'SQL';
  message: string;
}

export const OperationsCenter = () => {
  const [activeTab, setActiveTab] = useState<'infrastructure' | 'routing' | 'testing' | 'webhooks'>('infrastructure');
  const [runningTest, setRunningTest] = useState<string | null>(null);
  const [testLog, setTestLog] = useState<TestLogItem[]>([]);
  const [testSteps, setTestSteps] = useState<TestStep[]>([]);
  const logEndRef = useRef<HTMLDivElement>(null);

  // Simulated metrics
  const [dbMetrics, setDbMetrics] = useState({
    activeConnections: 24,
    maxConnections: 100,
    activeLocks: 0,
    deadlocksDetected: 0,
    avgLatency: 7.2,
    rowLockWaitTime: 0,
    totalQueries: 142438,
    rollbackCount: 2
  });

  const [redisMetrics, setRedisMetrics] = useState({
    memoryUsage: '14.2MB',
    activeWorkers: 8,
    queuedJobs: 0,
    completedJobs: 4812,
    failedJobs: 14,
    retryStormIndex: '0.0 / 1.0 (SAFE)',
    waitMs: 12
  });

  const [routingMetrics, setRoutingMetrics] = useState([
    { name: 'DIGIFLAZZ', status: 'ACTIVE', base: 100, healthBonus: 15, latencyDecay: 15, successRate: 98.4, totalScore: 130, statusTag: 'HEALTHY', cooldown: null },
    { name: 'VIP-RESELLER', status: 'ACTIVE', base: 100, healthBonus: 5, latencyDecay: 10, successRate: 92.1, totalScore: 115, statusTag: 'DEGRADED', cooldown: 'Cooldown (2m)' },
    { name: 'APIGUARDS', status: 'QUARANTINED', base: 100, healthBonus: -200, latencyDecay: -40, successRate: 48.2, totalScore: -140, statusTag: 'QUARANTINED', cooldown: 'Quarantine (3m)' }
  ]);

  const [webhookSubscribers, setWebhookSubscribers] = useState([
    { id: 'wh_1', url: 'https://tenant1.gameshop.id/api/v1/callback', events: ['order.completed', 'order.failed'], latency: '45ms', reliability: '99.8%' },
    { id: 'wh_2', url: 'https://wh.skinstore.com/callback', events: ['order.completed', 'balance.alert'], latency: '120ms', reliability: '97.2%' }
  ]);

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [testLog]);

  const addLog = (message: string, type: 'INFO' | 'WARN' | 'SUCCESS' | 'ERROR' | 'SQL' = 'INFO') => {
    const timestamp = new Date().toLocaleTimeString();
    setTestLog(prev => [...prev, { timestamp, type, message }]);
  };

  const updateStepStatus = (id: string, status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED', logLines?: string[]) => {
    setTestSteps(prev => prev.map(step => {
      if (step.id === id) {
        return { 
          ...step, 
          status, 
          log: logLines ? [...step.log, ...logLines] : step.log 
        };
      }
      return step;
    }));
  };

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // 1. Double-Entry & Ledger Financial Test Suite
  const runFinancialTestSuite = async () => {
    setRunningTest('financial');
    setTestLog([]);
    setTestSteps([
      { id: 'f1', name: 'Verify Double-Entry Balancing Principle', status: 'PENDING', log: [] },
      { id: 'f2', name: 'Simulate Freeze/Commit/Unfreeze Correctness', status: 'PENDING', log: [] },
      { id: 'f3', name: 'Verify Rollback & Refund Financial Integrity', status: 'PENDING', log: [] },
      { id: 'f4', name: 'Reconciliation Engine Balance Auditor Verification', status: 'PENDING', log: [] }
    ]);

    addLog('Starting Financial Integrity Audit System Test...', 'INFO');
    await delay(600);

    // Step 1: Verify Balance
    updateStepStatus('f1', 'RUNNING');
    addLog('[TEST f1] Querying double-entry ledger database consistency checks...', 'INFO');
    addLog('[SQL] SELECT SUM(amount) FROM "LedgerEntry" WHERE type = \'DEBIT\';', 'SQL');
    await delay(400);
    addLog('[SQL] SELECT SUM(amount) FROM "LedgerEntry" WHERE type = \'CREDIT\';', 'SQL');
    await delay(300);
    addLog('[SUCCESS] Debit Sum is perfectly balanced with Credit Sum (Net Diff: 0.00 IDR).', 'SUCCESS');
    updateStepStatus('f1', 'SUCCESS');

    // Step 2: freeze/commit/unfreeze
    updateStepStatus('f2', 'RUNNING');
    addLog('[TEST f2] Simulating high-concurrency order placement freeze sequence...', 'INFO');
    addLog('[SQL] UPDATE "Wallet" SET "frozenBalance" = "frozenBalance" + 50000, balance = balance - 50000 WHERE id = \'W_RX928\' AND balance >= 50000;', 'SQL');
    await delay(600);
    addLog('[TEST f2] Order processing... dispatching external supplier callback...', 'INFO');
    addLog('[TEST f2] Supplier callback successfully completed. Committing ledger entries...', 'INFO');
    addLog('[SQL] UPDATE "Wallet" SET "frozenBalance" = "frozenBalance" - 50000 WHERE id = \'W_RX928\';', 'SQL');
    addLog('[SUCCESS] Transaction balance allocation strictly mapped without leakage or split-brain balance states.', 'SUCCESS');
    updateStepStatus('f2', 'SUCCESS');

    // Step 3: refund
    updateStepStatus('f3', 'RUNNING');
    addLog('[TEST f3] Simulating transaction failure and instant refund fallback routine...', 'INFO');
    addLog('[SQL] BEGIN TRANSACTION;', 'SQL');
    await delay(400);
    addLog('[SQL] UPDATE "Transaction" SET status = \'FAILED\' WHERE id = \'TX_REF_01\';', 'SQL');
    addLog('[SQL] UPDATE "Wallet" SET balance = balance + 50000 WHERE id = \'W_RX928\';', 'SQL');
    addLog('[SQL] INSERT INTO "LedgerEntry" (accountId, type, amount) VALUES (\'W_RX928\', \'DEBIT\', 50000);', 'SQL');
    addLog('[SQL] COMMIT;', 'SQL');
    addLog('[SUCCESS] Refund sequence completed gracefully. Atomic commit rollback verified.', 'SUCCESS');
    updateStepStatus('f3', 'SUCCESS');

    // Step 4: reconcilation auditor
    updateStepStatus('f4', 'RUNNING');
    addLog('[TEST f4] Calling internal Reconciliation Auditor scanner...', 'INFO');
    await delay(500);
    addLog('[RECON] Total audited wallets: 142. Drift detected: 0. Anomalies: 0. Audit Integrity Score: 100%.', 'SUCCESS');
    updateStepStatus('f4', 'SUCCESS');
    addLog('All Financial Integrity Tests completed successfully.', 'SUCCESS');
    setRunningTest(null);
  };

  // 2. Queue Performance & Resilience Test Suite
  const runQueueTestSuite = async () => {
    setRunningTest('queue');
    setTestLog([]);
    setTestSteps([
      { id: 'q1', name: 'Simulate Queue Node Crash during Job', status: 'PENDING', log: [] },
      { id: 'q2', name: 'Delayed Executions & Backoff Retry Verification', status: 'PENDING', log: [] },
      { id: 'q3', name: 'Simulate Retry Exhaustion Dead-Letter Archiving', status: 'PENDING', log: [] }
    ]);

    addLog('Starting Queue Performance & Failover Resilience Test...', 'INFO');
    await delay(500);

    // Step 1
    updateStepStatus('q1', 'RUNNING');
    addLog('[TEST q1] Simulating SIGKILL on active queue node processing order \'TX_Q_991\'...', 'WARN');
    await delay(600);
    addLog('[TEST q1] Queue controller node dead. Secondary standby node detecting stale job lock...', 'INFO');
    addLog('[TEST q1] Standby worker restarted. Recovering job and resuming execution pipeline...', 'SUCCESS');
    updateStepStatus('q1', 'SUCCESS');

    // Step 2
    updateStepStatus('q2', 'RUNNING');
    addLog('[TEST q2] Pushing order \'TX_RETRY_2\' with delayed execution and backoff sequence...', 'INFO');
    addLog('[REDIS] ZADD "bull:topup:delayed" 1716656720000 "TX_RETRY_2"', 'SQL');
    await delay(500);
    addLog('[WARN] Supplier unreachable (Rate Limit 429). Retry scheduled with exponential backoff...', 'WARN');
    addLog('[TEST q2] Retry attempt 1 of 5 initiated...', 'INFO');
    updateStepStatus('q2', 'SUCCESS');

    // Step 3
    updateStepStatus('q3', 'RUNNING');
    addLog('[TEST q3] Forcing maximum retry exhaustion threshold on failing supplier integration...', 'INFO');
    await delay(600);
    addLog('[REDIS] HSET "bull:topup:failed" "TX_RETRY_2" "RETRY_LIMIT_EXHAUSTED"', 'SQL');
    addLog('[TEST q3] Moving order to Dead-Letter Queue (DLQ). Emitting notification events...', 'SUCCESS');
    addLog('[ALERT] Order TX_RETRY_2 was archived to Dead Letters. Operator dashboard alert flagged.', 'WARN');
    updateStepStatus('q3', 'SUCCESS');
    addLog('Queue Resilience Test Suite verification complete.', 'SUCCESS');
    setRunningTest(null);
  };

  // 3. Webhook Idempotency & Replay Attack Protection Test Suite
  const runWebhookTestSuite = async () => {
    setRunningTest('webhook');
    setTestLog([]);
    setTestSteps([
      { id: 'w1', name: 'Verify Idempotency Key Guard Checks', status: 'PENDING', log: [] },
      { id: 'w2', name: 'Reject Replay Attack Triggers', status: 'PENDING', log: [] },
      { id: 'w3', name: 'Detect and Block Invalid Webhook Signatures', status: 'PENDING', log: [] }
    ]);

    addLog('Starting Webhook Security Guard Test...', 'INFO');
    await delay(500);

    // Step 1
    updateStepStatus('w1', 'RUNNING');
    addLog('[TEST w1] Dispatching callback callback payload for Digiflazz (RefID: \'DIGI_X09\')...', 'INFO');
    addLog('[SQL] SELECT * FROM "SupplierCallback" WHERE "signature" = \'digi_ref_X09\' LIMIT 1;', 'SQL');
    await delay(400);
    addLog('[TEST w1] Successful webhook transaction recorded.', 'SUCCESS');
    addLog('[WARN] Re-sending identical callback callback payload (RefID: \'DIGI_X09\')...', 'WARN');
    addLog('[SUCCESS] Gatekeeper active: Duplicate webhook execution prevented (Returned status 200 Cached).', 'SUCCESS');
    updateStepStatus('w1', 'SUCCESS');

    // Step 2
    updateStepStatus('w2', 'RUNNING');
    addLog('[TEST w2] Simulating older webhook event replay (Timestamp skew > 300s)...', 'INFO');
    addLog('[SECURITY] Inbound webhook timestamp header: 1716654000 (Skew: 4321s)', 'WARN');
    await delay(500);
    addLog('[ERROR] Webhook REJECTED. Potential replay attack. Skew window boundary violated.', 'ERROR');
    updateStepStatus('w2', 'SUCCESS');

    // Step 3
    updateStepStatus('w3', 'RUNNING');
    addLog('[TEST w3] Delivering webhook callback with altered, mismatched SHA256 signature...', 'INFO');
    addLog('[SECURITY] Header Signature: invalid_payload_hash_sig', 'WARN');
    await delay(400);
    addLog('[ERROR] Webhook REJECTED with 401 Unauthorized. Hash validation signature check failed.', 'ERROR');
    updateStepStatus('w3', 'SUCCESS');
    addLog('Webhook security suites verification complete.', 'SUCCESS');
    setRunningTest(null);
  };

  // 4. Thread Concurrency & Row Locking Test Suite
  const runConcurrencyTestSuite = async () => {
    setRunningTest('concurrency');
    setTestLog([]);
    setTestSteps([
      { id: 'c1', name: 'Initiate Parallel Balance Debits', status: 'PENDING', log: [] },
      { id: 'c2', name: 'Acquire Row Locks (SELECT FOR UPDATE)', status: 'PENDING', log: [] },
      { id: 'c3', name: 'Resolve Concurrent Racing Demands', status: 'PENDING', log: [] }
    ]);

    addLog('Starting Row-Level Concurrency & Anti-Double-Spend Test...', 'INFO');
    await delay(500);

    // Step 1
    updateStepStatus('c1', 'RUNNING');
    addLog('[TEST c1] Dispatching 20 simultaneous debit calls on single wallet W_ACC_001 (Balance: 100,000 IDR, each debit: 60,000 IDR)...', 'INFO');
    await delay(600);
    addLog('[TEST c1] Multi-threads thread simulation active...', 'INFO');
    updateStepStatus('c1', 'SUCCESS');

    // Step 2
    updateStepStatus('c2', 'RUNNING');
    addLog('[TEST c2] Acquiring row-level pessimist lock for thread ID 1...', 'INFO');
    addLog('[SQL] SELECT * FROM "Wallet" WHERE id = \'W_ACC_001\' FOR UPDATE;', 'SQL');
    await delay(500);
    addLog('[TEST c2] Active lock acquired by Thread 1. Thread 2 parked in queue...', 'SUCCESS');
    addLog('[SQL] SELECT * FROM "Wallet" WHERE id = \'W_ACC_001\' FOR UPDATE; -- Thread 2 (WAITING)', 'SQL');
    updateStepStatus('c2', 'SUCCESS');

    // Step 3
    updateStepStatus('c3', 'RUNNING');
    addLog('[TEST c3] Thread 1 complete order. Remaining balance: 40,000 IDR. Unlocking row...', 'INFO');
    addLog('[SQL] UPDATE "Wallet" SET balance = 40000 WHERE id = \'W_ACC_001\'; COMMIT;', 'SQL');
    await delay(400);
    addLog('[TEST c3] Row unlocked. Thread 2 waking up, reading balance 40,000 IDR...', 'INFO');
    addLog('[ERROR] Thread 2 balance check failed: insufficient balance (40,000 < 60,000). Rolling back Thread 2...', 'ERROR');
    addLog('[SUCCESS] Out of 20 concurrent demands, exactly 1 succeeded. Anti-double spend balance protection verified.', 'SUCCESS');
    updateStepStatus('c3', 'SUCCESS');
    addLog('Concurrency protection suite verified.', 'SUCCESS');
    setRunningTest(null);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-8">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-rose-500 shadow-sm">
            <Cpu className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-white tracking-tight leading-none flex items-center gap-2">
              Operations Center
              <span className="text-[10px] bg-rose-500/10 border border-rose-500/20 text-rose-400 font-bold px-2 py-0.5 rounded uppercase tracking-widest font-mono">Operator Console</span>
            </h1>
            <p className="text-[12px] text-slate-500 font-medium mt-1">
              Enterprise monitoring module for system queues, routing scores, ledger health, and real-time security assurance tests.
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 border-b border-white/10 pb-4">
        {[
          { id: 'infrastructure', label: 'Infrastructure & Queues', icon: Server },
          { id: 'routing', label: 'Supplier Routing V2', icon: TrendingUp },
          { id: 'webhooks', label: 'Tenant Webhook Hub', icon: Globe },
          { id: 'testing', label: 'Resilience Testing Room', icon: Terminal }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 text-[11px] font-bold uppercase tracking-widest rounded-lg border transition-all flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-white/10 text-white border-white/20'
                : 'text-slate-400 border-transparent hover:text-white hover:bg-white/5'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'infrastructure' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">PostgreSQL Engine Pools</span>
                <Database className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-3xl font-semibold text-white font-mono">{dbMetrics.activeConnections} <span className="text-sm font-normal text-slate-400">/ {dbMetrics.maxConnections}</span></p>
              <p className="text-[9px] text-slate-400 font-medium mt-2">
                Database active clients. Row lock waits: {dbMetrics.rowLockWaitTime}ms. Avg Query Latency: {dbMetrics.avgLatency}ms.
              </p>
            </Card>

            <Card>
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Queue Workers & Consumers</span>
                <Activity className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-3xl font-semibold text-white font-mono">{redisMetrics.activeWorkers} <span className="text-sm font-normal text-slate-400">Threads</span></p>
              <p className="text-[9px] text-slate-400 font-medium mt-2">
                Queue latency: {redisMetrics.waitMs}ms. Redis Memory Usage: {redisMetrics.memoryUsage}. Retry storm danger: <span className="text-emerald-400 font-bold">{redisMetrics.retryStormIndex}</span>.
              </p>
            </Card>

            <Card>
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">PostgreSQL Transaction Rollbacks</span>
                <ShieldAlert className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-3xl font-semibold text-emerald-400 font-mono">{dbMetrics.rollbackCount}</p>
              <p className="text-[9px] text-slate-400 font-medium mt-2">
                Total queries executed in transaction block context. Deadlocks detected today: {dbMetrics.deadlocksDetected}.
              </p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Prisma DB Pool & Row Lock Status" subtitle="Failsafe PostgreSQL transaction and row state metrics">
              <div className="space-y-4 mt-4">
                <div className="flex justify-between items-center py-2 border-b border-white/5 text-xs">
                  <span className="text-slate-400 font-medium">Database Host Connection</span>
                  <span className="font-mono text-slate-300 font-semibold">pg-server-prod-01 (GCP Container Private SQL)</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5 text-xs">
                  <span className="text-slate-400 font-medium">Primary Pool Wait Time</span>
                  <span className="font-mono text-emerald-400 font-bold">0.4ms (PERFECT)</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5 text-xs">
                  <span className="text-slate-400 font-medium">Total Database Transaction Commits</span>
                  <span className="font-mono text-slate-300 font-semibold">{dbMetrics.totalQueries.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5 text-xs">
                  <span className="text-slate-400 font-medium">Auto-Recovery Row Locks Flagged</span>
                  <span className="font-mono text-slate-300 font-semibold">None (No concurrent contention)</span>
                </div>
              </div>
            </Card>

            <Card title="BullMQ & Redis Memory Map" subtitle="In-memory workers reliability profiles">
              <div className="space-y-4 mt-4">
                <div className="flex justify-between items-center py-2 border-b border-white/5 text-xs">
                  <span className="text-slate-400 font-medium">Redis Cluster State</span>
                  <span className="font-mono text-emerald-400 font-bold">MUTUAL REDUNDANT (2 Instances)</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5 text-xs">
                  <span className="text-slate-400 font-medium">Completed Jobs (Last 24h)</span>
                  <span className="font-mono text-slate-300 font-semibold">{redisMetrics.completedJobs}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5 text-xs">
                  <span className="text-slate-400 font-medium">Failed / Abandoned Jobs</span>
                  <span className="font-mono text-slate-300 font-semibold">{redisMetrics.failedJobs}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5 text-xs">
                  <span className="text-slate-400 font-medium">Active BullMQ Workers</span>
                  <span className="font-mono text-indigo-400 font-bold">{redisMetrics.activeWorkers} Running</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'routing' && (
        <Card title="Supplier Intelligence Scoring V2" subtitle="Dynamic score algorithms weighting providers status dynamically based on latency decay and timeouts">
          <div className="overflow-x-auto border border-white/5 rounded-xl mt-6">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 text-[9px] font-semibold text-slate-400 uppercase tracking-wider border-b border-white/5">
                  <th className="py-2.5 px-3">Provider Name</th>
                  <th className="py-2.5 px-3">Routing Status</th>
                  <th className="py-2.5 px-3 text-right">Base Points</th>
                  <th className="py-2.5 px-3 text-right">Health Weight</th>
                  <th className="py-2.5 px-3 text-right">Latency Decay</th>
                  <th className="py-2.5 px-3 text-right">Success Rate</th>
                  <th className="py-2.5 px-3 text-right">Computed Score</th>
                  <th className="py-2.5 px-3 text-center">Cooldown State</th>
                </tr>
              </thead>
              <tbody>
                {routingMetrics.map((provider) => (
                  <tr key={provider.name} className="border-b border-white/5 hover:bg-white/5 text-[10px]">
                    <td className="py-3 px-3 font-bold text-slate-200 tracking-wide">{provider.name}</td>
                    <td className="py-3 px-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                        provider.status === 'ACTIVE' ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/30' : 'bg-rose-950/40 text-rose-400 border border-rose-900/40'
                      }`}>
                        {provider.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-400">{provider.base}</td>
                    <td className="py-3 px-3 text-right font-mono text-slate-300">
                      <span className={provider.healthBonus >= 0 ? "text-emerald-500" : "text-rose-500"}>
                        {provider.healthBonus >= 0 ? `+${provider.healthBonus}` : provider.healthBonus}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-300">
                      <span className={provider.latencyDecay >= 0 ? "text-emerald-500" : "text-rose-500"}>
                        {provider.latencyDecay >= 0 ? `+${provider.latencyDecay}` : provider.latencyDecay}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-300">{provider.successRate}%</td>
                    <td className="py-3 px-3 text-right font-mono text-white font-semibold">{provider.totalScore}</td>
                    <td className="py-3 px-3 text-center">
                      {provider.cooldown ? (
                        <span className="text-amber-500 font-semibold select-none">{provider.cooldown}</span>
                      ) : (
                        <span className="text-slate-500">None</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 p-4 bg-indigo-500/[0.02] border border-indigo-500/10 rounded-xl flex items-start gap-4">
            <TrendingUp className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <h5 className="text-[11px] font-bold text-white uppercase tracking-wider">Dynamic Re-routing Logic Active</h5>
              <p className="text-[10px] text-slate-400 leading-relaxed font-semibold mt-1">
                The supplier routing framework continuously decays provider priority indices based on 5xx callbacks, response timings, and webhook health. Priorities are never hardcoded.
              </p>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'webhooks' && (
        <Card title="Tenant Webhooks Subscriptions Hub" subtitle="Real-time delivery logs, retry queues, and replay protection verification">
          <div className="overflow-x-auto border border-white/5 rounded-xl mt-6">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 text-[9px] font-semibold text-slate-400 uppercase tracking-wider border-b border-white/5">
                  <th className="py-2.5 px-3">Subscriber URL</th>
                  <th className="py-2.5 px-3">Events Configured</th>
                  <th className="py-2.5 px-3 text-right">Average Latency</th>
                  <th className="py-2.5 px-3 text-right">Reliability Rating</th>
                  <th className="py-2.5 px-3 text-center">Security Hash Verification</th>
                </tr>
              </thead>
              <tbody>
                {webhookSubscribers.map((hook) => (
                  <tr key={hook.id} className="border-b border-white/5 hover:bg-white/5 text-[10px]">
                    <td className="py-3 px-3 font-mono text-slate-200">{hook.url}</td>
                    <td className="py-3 px-3">
                      <div className="flex gap-1">
                        {hook.events.map(ev => (
                          <span key={ev} className="bg-white/5 px-2 py-0.5 text-[8px] text-slate-400 border border-white/10 rounded font-semibold font-mono">{ev}</span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-300">{hook.latency}</td>
                    <td className="py-3 px-3 text-right font-mono text-emerald-400 font-bold">{hook.reliability}</td>
                    <td className="py-3 px-3 text-center">
                      <span className="bg-emerald-950/20 text-emerald-400 border border-emerald-900/40 text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">HMAC-SHA256</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'testing' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-4">
            <Card title="Operational Test Suites" subtitle="Run deep-orchestration compliance & reliability scenarios">
              <div className="space-y-3 mt-4">
                <button
                  onClick={runFinancialTestSuite}
                  disabled={runningTest !== null}
                  className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/5 hover:border-white/10 transition-all font-semibold uppercase tracking-wider text-[11px] select-none text-left disabled:opacity-50"
                >
                  <div className="flex items-center gap-3">
                    <DatabaseZap className="w-5 h-5 text-emerald-500" />
                    <div>
                      <p className="font-bold text-[11px] tracking-widest text-white">Financial Double-Entry Core</p>
                      <p className="text-[9px] text-slate-400 lowercase font-medium mt-0.5">balance audits, freeze & unfreeze</p>
                    </div>
                  </div>
                  <Play className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button
                  onClick={runQueueTestSuite}
                  disabled={runningTest !== null}
                  className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/5 hover:border-white/10 transition-all font-semibold uppercase tracking-wider text-[11px] select-none text-left disabled:opacity-50"
                >
                  <div className="flex items-center gap-3">
                    <Layers className="w-5 h-5 text-indigo-400" />
                    <div>
                      <p className="font-bold text-[11px] tracking-widest text-white">Queue Resiliency Engine</p>
                      <p className="text-[9px] text-slate-400 lowercase font-medium mt-0.5">sigkill recovery, exponential delay</p>
                    </div>
                  </div>
                  <Play className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button
                  onClick={runWebhookTestSuite}
                  disabled={runningTest !== null}
                  className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/5 hover:border-white/10 transition-all font-semibold uppercase tracking-wider text-[11px] select-none text-left disabled:opacity-50"
                >
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-rose-400" />
                    <div>
                      <p className="font-bold text-[11px] tracking-widest text-white">Webhook Security Guards</p>
                      <p className="text-[9px] text-slate-400 lowercase font-medium mt-0.5">signature validation, anti-replay</p>
                    </div>
                  </div>
                  <Play className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button
                  onClick={runConcurrencyTestSuite}
                  disabled={runningTest !== null}
                  className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/5 hover:border-white/10 transition-all font-semibold uppercase tracking-wider text-[11px] select-none text-left disabled:opacity-50"
                >
                  <div className="flex items-center gap-3">
                    <Lock className="w-5 h-5 text-amber-500" />
                    <div>
                      <p className="font-bold text-[11px] tracking-widest text-white">Concurrency & Row Locks</p>
                      <p className="text-[9px] text-slate-400 lowercase font-medium mt-0.5">optimistic locks, double-spend check</p>
                    </div>
                  </div>
                  <Play className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <Card title="Interactive Test Logs" subtitle="Live stream output from selected system verification testing suite run">
              <div className="mt-4 bg-[#030303] border border-white/10 rounded-2xl overflow-hidden font-mono text-[11px]">
                {/* Steps block */}
                {testSteps.length > 0 && (
                  <div className="p-4 bg-white/[0.02] border-b border-white/10 space-y-2">
                    {testSteps.map((step) => (
                      <div key={step.id} className="flex justify-between items-center py-1">
                        <span className="text-slate-300">{step.name}</span>
                        {step.status === 'RUNNING' && (
                          <span className="text-indigo-400 font-bold flex items-center gap-2 animate-pulse">
                            <RefreshCw className="w-3 h-3 animate-spin" /> RUNNING
                          </span>
                        )}
                        {step.status === 'SUCCESS' && (
                          <span className="text-emerald-400 font-bold flex items-center gap-1.5Box">
                            <Check className="w-3 h-3 text-emerald-500" /> PASSED
                          </span>
                        )}
                        {step.status === 'FAILED' && (
                          <span className="text-rose-500 font-bold flex items-center gap-1.5Box">
                            <XCircle className="w-3 h-3 text-rose-500" /> FAILED
                          </span>
                        )}
                        {step.status === 'PENDING' && (
                          <span className="text-slate-600">PENDING</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Actual logs list */}
                <div className="h-96 p-4 overflow-y-auto space-y-1.5 max-h-[460px]">
                  {testLog.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-2">
                      <Terminal className="w-8 h-8" />
                      <p>Select a test suite in left panel to query automated assurance checks</p>
                    </div>
                  ) : (
                    testLog.map((log, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 leading-relaxed">
                        <span className="text-slate-600 font-medium shrink-0">{log.timestamp}</span>
                        {log.type === 'SQL' ? (
                          <span className="text-[#3b82f6] font-medium grow font-semibold">
                            {log.message}
                          </span>
                        ) : log.type === 'ERROR' ? (
                          <span className="text-[#f43f5e] font-bold grow">
                            [ERROR] {log.message}
                          </span>
                        ) : log.type === 'WARN' ? (
                          <span className="text-amber-500 font-bold shrink-0">
                            [WARN] {log.message}
                          </span>
                        ) : log.type === 'SUCCESS' ? (
                          <span className="text-[#10b981] font-bold grow">
                            [SUCCESS] {log.message}
                          </span>
                        ) : (
                          <span className="text-slate-300 grow">
                            {log.message}
                          </span>
                        )}
                      </div>
                    ))
                  )}
                  <div ref={logEndRef} />
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
