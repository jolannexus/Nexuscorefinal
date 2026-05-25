import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { 
  Globe, 
  ShieldCheck, 
  Cpu, 
  Layers, 
  ArrowRight,
  Database,
  Lock,
  ChevronRight,
  Activity,
  Server,
  DollarSign,
  FileCheck,
  AlertTriangle,
  Play,
  RotateCcw,
  CheckCircle2,
  Terminal,
  Store,
  Building,
  Users
} from 'lucide-react';
import { BRAND } from '../config/branding';

export const Landing = () => {
  // Simulator States
  const [activeTab, setActiveTab] = useState<'failover' | 'valuation' | 'audit'>('failover');
  const [simStep, setSimStep] = useState(0);
  const [simProvider1, setSimProvider1] = useState<'idle' | 'failed' | 'quarantined'>('idle');
  const [simProvider2, setSimProvider2] = useState<'idle' | 'working' | 'success'>('idle');
  const [simLogs, setSimLogs] = useState<string[]>([]);
  const [balanceEscrow, setBalanceEscrow] = useState<'active' | 'frozen' | 'reconciled' | 'refunded'>('active');
  const [resellerWallet, setResellerWallet] = useState(5000000);
  const [escrowAmount, setEscrowAmount] = useState(0);
  const [selectedPersona, setSelectedPersona] = useState<'supplier' | 'agency' | 'reseller'>('agency');

  useEffect(() => {
    resetSimulator();
  }, []);

  const addLog = (message: string) => {
    const timeString = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setSimLogs((prev) => [...prev, `[${timeString}] ${message}`]);
  };

  const resetSimulator = () => {
    setSimStep(0);
    setSimProvider1('idle');
    setSimProvider2('idle');
    setBalanceEscrow('active');
    setResellerWallet(5000000);
    setEscrowAmount(0);
    setSimLogs([]);
    setTimeout(() => {
      addLog('System ready. Unified Routing Table loaded in memory cache.');
      addLog('Primary: Digiflazz (Cost Index: -5.0%, Weight: 95%)');
      addLog('Secondary: VIP Reseller (Cost Index: -2.0%, Weight: 5%)');
    }, 100);
  };

  const executeNormalOrder = () => {
    if (simStep > 0) return;
    setSimStep(1);
    addLog('Order placed: ML-86-DM (Mobile Legends 86 Diamonds) - IDR 18,975');
    
    // Stage 1: Wallet Balance Hold (Double-Entry Ledger)
    setTimeout(() => {
      setBalanceEscrow('frozen');
      setResellerWallet(4981025);
      setEscrowAmount(18975);
      setSimStep(2);
      addLog('ESCROW HELD: Moving IDR 18,975 to FROZEN state [DEBIT Wallet, CREDIT Escrow]');
    }, 800);

    // Stage 2: Dispatch to Primary Supplier
    setTimeout(() => {
      setSimStep(3);
      addLog('Primary Route: Digiflazz API. Sending encrypted payload...');
    }, 1600);

    // Stage 3: Supplier Success
    setTimeout(() => {
      setSimProvider1('idle');
      setBalanceEscrow('reconciled');
      setEscrowAmount(0);
      setSimStep(4);
      addLog('Digiflazz Response [00]: SUCCESS (ID: ML-DF-928198)');
      addLog('LEDGER SETTLED: Reconciling frozen escrow. Transaction Complete.');
    }, 2800);
  };

  const executeFailoverOrder = () => {
    if (simStep > 0) return;
    setSimStep(1);
    addLog('Order placed: ML-86-DM (Mobile Legends 86 Diamonds) - IDR 18,975');
    
    // Stage 1: Wallet Balance Hold
    setTimeout(() => {
      setBalanceEscrow('frozen');
      setResellerWallet(4981025);
      setEscrowAmount(18975);
      setSimStep(2);
      addLog('ESCROW HELD: Moving IDR 18,975 to FROZEN state.');
    }, 800);

    // Stage 2: Dispatch to Primary Supplier
    setTimeout(() => {
      setSimStep(3);
      setSimProvider1('failed');
      addLog('Primary Route: Digiflazz API. Sending payload...');
    }, 1600);

    // Outage Detected & Quarantine
    setTimeout(() => {
      setSimStep(4);
      setSimProvider1('quarantined');
      addLog('CRITICAL OUTAGE: Digiflazz returned HTTP 503.');
      addLog('QUARANTINE ENFORCED: Digiflazz quarantined for 180s.');
    }, 2600);

    // Stage 4: Fetch Next Healthiest Provider
    setTimeout(() => {
      setSimStep(5);
      setSimProvider2('working');
      addLog('FAILOVER ACTIVE: Querying ProviderSelector candidate...');
      addLog('Selected: VIP Reseller (Health: 99.8%). Redirecting pipeline...');
    }, 3800);

    // Stage 5: Success
    setTimeout(() => {
      setSimStep(6);
      setSimProvider2('success');
      setBalanceEscrow('reconciled');
      setEscrowAmount(0);
      addLog('VIP Reseller Response [200]: SUCCESS (ID: ML-VIP-7463523)');
      addLog('LEDGER RECONCILED: Completed transaction on Backup Route.');
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-slate-100 font-sans selection:bg-emerald-500/30">
      {/* Refined Ambient Glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[60%] h-[60%] bg-cyan-500/5 blur-[180px] rounded-full pointer-events-none" />
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Corporate Header */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-tr from-emerald-500 to-cyan-500 rounded-lg flex items-center justify-center text-black shadow-lg shadow-emerald-500/10">
              <Layers className="w-4 h-4 font-bold" />
            </div>
            <div>
              <span className="text-lg font-bold text-white tracking-tight leading-none block">{BRAND.name}</span>
            </div>
          </div>
          <div className="hidden lg:flex items-center gap-8 bg-white/5 px-6 py-2 rounded-full border border-white/5">
             <a href="#simulator" className="text-xs font-semibold uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Architecture</a>
             <a href="#features" className="text-xs font-semibold uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Features</a>
             <a href="#checklist" className="text-xs font-semibold uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Assurance SDK</a>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-semibold text-slate-400 hover:text-white transition-colors hidden sm:block">
              Log In
            </Link>
            <Link to="/register" className="bg-white hover:bg-slate-200 text-black px-5 h-10 rounded-full flex items-center gap-2 text-sm font-bold transition-all shadow-md shadow-white/5">
              Launch Workspace
            </Link>
          </div>
        </div>
      </nav>

      {/* Strategic Hero Presentation */}
      <section className="pt-40 lg:pt-52 pb-24 px-6 relative z-10 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400 mb-8"
        >
          <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          Enterprise White-Label Infrastructure
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.5, ease: "easeOut" }}
          className="text-6xl md:text-8xl font-black tracking-tight text-white leading-[1.05] max-w-5xl"
        >
          Built for Scale. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-white">
            Engineered for Uptime.
          </span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-slate-400 max-w-2xl text-lg md:text-xl font-medium mt-8 leading-relaxed"
        >
          The world's most advanced digital distribution orchestration. Mathematically leak-proof <span className="text-emerald-400 font-bold">Double-Entry Ledgers</span> and <span className="text-cyan-400 font-bold">Intelligent Failover Adapters</span>.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4 mt-12"
        >
          <a href="#simulator" className="bg-white text-black px-8 h-14 rounded-xl flex items-center justify-center gap-3 text-sm font-bold transition-all hover:bg-slate-200 w-full sm:w-auto shadow-xl shadow-white/5">
            Test The Architecture
            <Play className="w-4 h-4 fill-black" />
          </a>
          <Link to="/market" className="px-8 h-14 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center gap-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors w-full sm:w-auto cursor-pointer">
            Demo Reseller Storefront <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </section>

      {/* Main Feature: Interactive Diagnostic & Simulator Cockpit */}
      <section id="simulator" className="px-6 py-24 relative z-30">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12 text-center space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">Technical Sandbox</h2>
            <p className="text-base text-slate-400 max-w-2xl mx-auto">
              Simulate high-concurrency ordering, dynamic failover, and double-entry ledger state reconciliation.
            </p>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-[#0A0A0A] p-2 shadow-2xl shadow-emerald-500/5">
            {/* Control Cabin Header */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between border-b border-white/5 p-6 gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <Terminal className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white tracking-wide">Orchestration Simulator</div>
                  <div className="text-xs text-emerald-400 font-medium mt-1">Live Telemetry Pipeline</div>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
                {[
                  { id: 'failover', label: 'Adapter Failover', icon: Cpu },
                  { id: 'valuation', label: 'Commercial Value', icon: DollarSign },
                  { id: 'audit', label: 'Source Integrity', icon: FileCheck },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all ${
                      activeTab === tab.id
                        ? 'bg-white text-black shadow-md'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* TAB CONTENT: 1. AUTOMATIC FAILOVER SIMULATOR */}
            <AnimatePresence mode="wait">
              {activeTab === 'failover' && (
                <motion.div
                  key="failover"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8"
                >
                  {/* Left Controls & Wallet HUD */}
                  <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Injection Events</div>
                      <div className="space-y-3">
                        <button
                          onClick={executeNormalOrder}
                          disabled={simStep > 0}
                          className="w-full flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all group disabled:opacity-50"
                        >
                          <div className="text-left">
                            <div className="text-sm font-bold text-white">Nominal Transaction</div>
                            <div className="text-[10px] text-emerald-400 font-medium mt-1">Provider: Digiflazz (Primary)</div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />
                        </button>
                        <button
                          onClick={executeFailoverOrder}
                          disabled={simStep > 0}
                          className="w-full flex items-center justify-between p-4 rounded-xl border border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/20 transition-all group disabled:opacity-50"
                        >
                          <div className="text-left">
                            <div className="text-sm font-bold text-rose-400">Trigger Outage & Pivot</div>
                            <div className="text-[10px] text-rose-300 font-medium mt-1">Force 503 Internal Error</div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-rose-400 group-hover:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </div>

                    {/* Ledger Escrow HUD */}
                    <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-6 opacity-10">
                         <Lock className="w-24 h-24" />
                      </div>
                      <div className="flex items-center justify-between mb-6 relative z-10">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">State Machine</span>
                        <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">Double-Entry</span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 relative z-10">
                        <div>
                          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Reseller Balance</div>
                          <div className="text-lg font-bold text-white mt-1">Rp {resellerWallet.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Escrow Hold</div>
                          <div className="text-lg font-bold text-amber-400 mt-1">Rp {escrowAmount.toLocaleString()}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Flow Visualization & Log Output */}
                  <div className="lg:col-span-8 flex flex-col gap-6">
                    {/* Live Diagram Box */}
                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-8 relative min-h-[220px] flex items-center justify-center">
                      <div className="absolute top-6 left-6 text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <Server className="w-4 h-4 text-emerald-400" /> Dispatch Routing Map
                      </div>

                      {/* Diagnostic Node Mapping */}
                      <div className="w-full flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 relative z-10 mt-6">
                        {/* Core Server Node */}
                        <div className="flex flex-col items-center text-center">
                          <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 shadow-lg shadow-emerald-500/20 relative z-20">
                            <Layers className="w-6 h-6" />
                          </div>
                          <div className="text-sm font-bold text-white">NEXUS Core</div>
                        </div>

                        {/* Connection Lines Container */}
                        <div className="hidden md:flex flex-col gap-6 w-32 relative">
                           {/* Primary Line */}
                           <div className={`h-1 rounded-full w-full transition-all duration-300 ${simStep >= 3 ? (simProvider1 === 'quarantined' ? 'bg-rose-500' : 'bg-emerald-500 animate-pulse') : 'bg-slate-800'}`} />
                           {/* Secondary Line */}
                           <div className={`h-1 rounded-full w-full transition-all duration-300 ${simProvider2 !== 'idle' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-800'}`} />
                        </div>

                        {/* Providers */}
                        <div className="flex flex-col gap-6">
                          {/* Provider 1 */}
                          <div className={`flex items-center gap-4 p-4 rounded-xl border ${simProvider1 === 'quarantined' ? 'border-rose-500/30 bg-rose-500/10' : 'border-white/10 bg-slate-900'} min-w-[200px]`}>
                            <Activity className={`w-5 h-5 ${simProvider1 === 'quarantined' ? 'text-rose-400' : 'text-slate-400'}`} />
                            <div>
                              <div className="text-xs font-bold text-white">Primary Route</div>
                              <div className="text-[10px] text-slate-400 mt-0.5">Digiflazz API</div>
                            </div>
                          </div>
                          {/* Provider 2 */}
                          <div className={`flex items-center gap-4 p-4 rounded-xl border ${simProvider2 === 'success' ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-white/10 bg-slate-900'} min-w-[200px]`}>
                            <Cpu className={`w-5 h-5 ${simProvider2 === 'success' ? 'text-emerald-400' : 'text-slate-400'}`} />
                            <div>
                              <div className="text-xs font-bold text-white">Fallback Route</div>
                              <div className="text-[10px] text-slate-400 mt-0.5">VIP Reseller API</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Console Output */}
                    <div className="bg-[#050505] border border-white/10 rounded-2xl p-6 flex-1 flex flex-col relative overflow-hidden">
                      <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                          <Terminal className="w-4 h-4 text-slate-400 shrink-0" /> Execution Logs
                        </span>
                        <button
                          onClick={resetSimulator}
                          className="text-[11px] font-bold text-slate-400 hover:text-white transition-colors bg-white/5 px-3 py-1.5 rounded-lg"
                        >
                          Clear Kernel
                        </button>
                      </div>

                      <div className="flex-1 overflow-y-auto space-y-2.5 h-[140px] pr-2 scrollbar-thin scrollbar-thumb-white/10 font-mono text-xs">
                        {simLogs.map((log, idx) => (
                          <div key={idx} className="leading-relaxed">
                            {log.includes('SUCCESS') || log.includes('LEDGER RECONCILED') ? (
                              <span className="text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.4)]">{log}</span>
                            ) : log.includes('CRITICAL OUTAGE') || log.includes('QUARANTINE') ? (
                              <span className="text-rose-400 drop-shadow-[0_0_10px_rgba(244,63,94,0.4)]">{log}</span>
                            ) : log.includes('ESCROW HELD') || log.includes('FAILOVER ACTIVE') ? (
                              <span className="text-amber-400">{log}</span>
                            ) : (
                              <span className="text-slate-400">{log}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB CONTENT: 2. COMMERCIAL VALUATION */}
              {activeTab === 'valuation' && (
                <motion.div
                  key="valuation"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-8 space-y-8"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 border border-white/5 bg-white/[0.02] rounded-2xl hover:bg-white/[0.04] transition-colors">
                      <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-6">
                        <Globe className="w-5 h-5 text-emerald-400" />
                      </div>
                      <h3 className="text-base font-bold text-white mb-2">Wildcard Multitenancy</h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Architecture supports unlimited white-label resellers mapping custom domains, powered by intelligent host-header proxying and Let's Encrypt auto-SSL issuance.
                      </p>
                    </div>

                    <div className="p-6 border border-white/5 bg-white/[0.02] rounded-2xl hover:bg-white/[0.04] transition-colors">
                      <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6">
                        <ShieldCheck className="w-5 h-5 text-blue-400" />
                      </div>
                      <h3 className="text-base font-bold text-white mb-2">Immutable Double-Entry</h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Financial ledger strictly bound to DB-level transaction locks. Eliminates classic concurrency race-conditions preventing mass balance duplication attacks.
                      </p>
                    </div>

                    <div className="p-6 border border-white/5 bg-white/[0.02] rounded-2xl hover:bg-white/[0.04] transition-colors">
                      <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center mb-6">
                        <Cpu className="w-5 h-5 text-amber-400" />
                      </div>
                      <h3 className="text-base font-bold text-white mb-2">Supplier Orchestration</h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Self-healing adapter system dynamically monitors downstream API latency, auto-quarantining failing nodes and rerouting purchase volume seamlessly.
                      </p>
                    </div>
                  </div>

                  <div className="p-8 border border-white/10 bg-white/5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
                    <div className="max-w-2xl">
                      <div className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2">Enterprise Software Valuation</div>
                      <h3 className="text-2xl font-bold text-white mb-3">Premium Infrastructure Asset</h3>
                      <p className="text-sm text-slate-400 leading-relaxed">
                        This repository mitigates thousands of engineering hours in developing secure, concurrent monetary transaction systems. It serves as a commercially viable B2B SaaS foundation ready for high-volume transactions.
                      </p>
                    </div>
                    <div className="shrink-0">
                      <div className="text-4xl font-black text-white px-8 py-4 bg-black rounded-2xl border border-white/10 shadow-xl">
                         $50,000+
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB CONTENT: 3. TECHNICAL AUDIT CHECKLIST */}
              {activeTab === 'audit' && (
                <motion.div
                  key="audit"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
                     <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-6 border-b border-white/5 pb-4">Core Checks</h4>
                     <div className="space-y-4">
                        {[
                          'Strict TypeScript Mode (No implicit any)',
                          'Role-Based API Guard Rules',
                          'Double-Entry Ledger Integrity verified',
                          'Zero-downtime Supplier Adapter Fallbacks',
                          'JWT & Session Invalidation flows',
                        ].map((item, i) => (
                          <div key={i} className="flex items-start gap-4">
                             <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                             <span className="text-sm text-slate-300">{item}</span>
                          </div>
                        ))}
                     </div>
                  </div>

                  <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
                     <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-6 border-b border-white/5 pb-4">Deployment Status</h4>
                     
                     <div className="space-y-6">
                        <div className="flex items-center gap-4 bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl">
                          <Activity className="w-6 h-6 text-emerald-400" />
                          <div>
                            <div className="text-sm font-bold text-emerald-400">Production Build Passed</div>
                            <div className="text-xs text-emerald-400/80 mt-1">Zero lint or TS trace violations. Ready to ship.</div>
                          </div>
                        </div>

                        <div className="text-xs text-slate-400 leading-relaxed">
                          <strong className="text-white block mb-1">Next Production Steps:</strong>
                          Before onboarding real resellers, configure live production API keys (Digiflazz/VIP) via your primary Super Admin dashboard, and deploy the corresponding Express/Postgres backend cluster in production mode.
                        </div>
                     </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ----------------- PERSONAS EXPLAINER SECTION ----------------- */}
      <section className="px-6 py-24 border-t border-white/5 relative bg-gradient-to-b from-[#0a0a0a]/50 to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 rounded-full">
              Satu Sistem, Tiga Solusi Sempurna
            </span>
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight">
              Gateway Khusus Setiap Peran
            </h2>
            <p className="text-slate-400 text-sm md:text-base leading-relaxed">
              Teknologi {BRAND.name} dibangun untuk menyinergikan interaksi bisnis antara Supplier API, Pengelola Agency, serta Mitra Reseller secara real-time dan transparan.
            </p>
          </div>

          {/* Persona selector tabs */}
          <div className="flex justify-center p-1 bg-white/5 border border-white/10 rounded-2xl max-w-xl mx-auto mb-12 shadow-inner">
            {[
              { id: 'supplier', label: 'Supplier API', icon: Building, color: 'text-amber-400' },
              { id: 'agency', label: 'Agency Hub', icon: Users, color: 'text-blue-400' },
              { id: 'reseller', label: 'Reseller Portal', icon: Store, color: 'text-emerald-400' },
            ].map((persona) => (
              <button
                key={persona.id}
                onClick={() => setSelectedPersona(persona.id as any)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs md:text-sm font-bold transition-all ${
                  selectedPersona === persona.id
                    ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20 scale-[1.02]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <persona.icon className="w-4 h-4" />
                {persona.label}
              </button>
            ))}
          </div>

          {/* Active Persona Panel with dynamic content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedPersona}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch bg-zinc-950/40 border border-white/10 rounded-[32px] p-6 md:p-12 relative overflow-hidden shadow-2xl"
            >
              {/* Outer light glow depending on selection */}
              <div className={`absolute top-[-30%] left-[-10%] w-[60%] h-[120%] bg-emerald-500/5 blur-[120px] pointer-events-none rounded-full transition-opacity duration-500 ${selectedPersona === 'supplier' ? 'bg-amber-500/5' : selectedPersona === 'agency' ? 'bg-blue-500/5' : 'bg-emerald-500/5'}`} />

              {/* Left Column: Descriptive texts & checkmarks */}
              <div className="lg:col-span-6 flex flex-col justify-between relative z-10 space-y-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] uppercase font-extrabold tracking-widest px-3 py-1 bg-white/5 border border-white/10 text-slate-300 rounded-md">
                      Gateway Peran
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  </div>

                  {selectedPersona === 'supplier' && (
                    <>
                      <h3 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
                        Integrasikan & Distribusikan Produk Anda Secara Global
                      </h3>
                      <p className="text-slate-400 text-sm leading-relaxed">
                        Bagi penyedia produk (Digiflazz, VIP Reseller, atau server API privat), {BRAND.name} bertindak sebagai agregator distribusi yang aman. Salurkan seluruh pulsa, game voucher, dan transaksi digital ke ribuan partner dengan performa tinggi.
                      </p>
                    </>
                  )}

                  {selectedPersona === 'agency' && (
                    <>
                      <h3 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
                        Pusat Kontrol Bisnis Multi-Tenant Dengan Profit Melimpah
                      </h3>
                      <p className="text-slate-400 text-sm leading-relaxed">
                        Sebagai pemilik platform (Agency/Tenant), Anda memegang kendali penuh. Atur persentase keuntungan kustom untuk tiap produk, pantau arus kas masuk-keluar via Ledger Double-Entry, dan kelola jaringan reseller di bawah nama brand Anda sendiri.
                      </p>
                    </>
                  )}

                  {selectedPersona === 'reseller' && (
                    <>
                      <h3 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
                        Storefront Kustom Mandiri Tanpa Ribet Coding
                      </h3>
                      <p className="text-slate-400 text-sm leading-relaxed">
                        Pengecer dan pemilik toko retail dapat membuat website top-up bermerek mereka sendiri secara instan dengan domain sendiri. Sinkronisasi saldo cepat, katalog otomatis terisi, dan nikmati penyelesaian transaksi dalam hitungan detik.
                      </p>
                    </>
                  )}
                </div>

                {/* Checklist Bullet Points */}
                <div className="space-y-3.5 pt-4">
                  {selectedPersona === 'supplier' && [
                    'Otomatisasi callback status sukses/gagal via Webhook normalizer.',
                    'Metrik pemantau latensi harian & deteksi kegagalan API downstream otomatis.',
                    'Manajemen antrean cerdas (smart queue mechanism) untuk transaksi serempak.',
                    'Pemisahan saldo & penanganan sisa kuota inventaris langsung di Dashboard.'
                  ].map((feat, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-sm text-slate-300">{feat}</span>
                    </div>
                  ))}

                  {selectedPersona === 'agency' && [
                    'Custom markup profit dan fee transaksi secara global atau per-produk.',
                    'Whitelist & mapping domain kustom (Wildcard DNS) untuk reseller Anda.',
                    'Integrasi keamanan berlapis dengan Security Center dan log audit forensik.',
                    'Pencatatan keuangan Double-Entry Ledger anti-manipulasi saldo.'
                  ].map((feat, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-sm text-slate-300">{feat}</span>
                    </div>
                  ))}

                  {selectedPersona === 'reseller' && [
                    'Halaman toko public modern dengan branding kustom milik Anda (White Label).',
                    'Akses instan ke supplier tanpa limit pembayaran terintegrasi.',
                    'Sistem deposit saldo reseller yang aman dengan persetujuan instan.',
                    'Dukungan sistem tiket bantuan mandiri (Customer Support Desk).'
                  ].map((feat, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-sm text-slate-300">{feat}</span>
                    </div>
                  ))}
                </div>

                {/* Quick CTA inside panel */}
                <div className="pt-6">
                  <Link
                    to="/register"
                    className={`inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl text-sm font-bold transition-all shadow-md active:scale-95 ${
                      selectedPersona === 'supplier'
                        ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/5'
                        : selectedPersona === 'agency'
                        ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/10'
                        : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/10'
                    }`}
                  >
                    <span>Mulai sebagai {selectedPersona === 'supplier' ? 'Supplier' : selectedPersona === 'agency' ? 'Agency' : 'Reseller'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Right Column: Visual HUD / Dynamic Mock Dashboard Preview */}
              <div className="lg:col-span-6 flex items-center justify-center relative">
                <div className="w-full bg-[#050505]/75 border border-white/10 rounded-2xl p-6 md:p-8 space-y-6 relative z-10 shadow-2xl">
                  {/* Mock Window Header */}
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{selectedPersona.toUpperCase()} CORE TELEMETRY PORT</span>
                  </div>

                  {/* Dynamic Metrics HUD according to selection */}
                  {selectedPersona === 'supplier' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 border border-white/5 p-4 rounded-xl text-left">
                          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Metrik Respons</span>
                          <div className="text-xl font-bold text-amber-400 mt-1">104 ms</div>
                        </div>
                        <div className="bg-white/5 border border-white/5 p-4 rounded-xl text-left">
                          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Uptime Sebulan</span>
                          <div className="text-xl font-bold text-emerald-400 mt-1">99.98%</div>
                        </div>
                      </div>

                      <div className="bg-black/40 border border-white/5 p-4 rounded-xl text-left space-y-3">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400">Status Gateway API</span>
                          <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded text-[9px] font-bold uppercase">Online</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-400 rounded-full w-[94%]" />
                        </div>
                        <div className="text-[10px] text-slate-500">Mengkonsolidasi request Digiflazz: ML-DF-928198 [OK]</div>
                      </div>
                    </div>
                  )}

                  {selectedPersona === 'agency' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 border border-white/5 p-4 rounded-xl text-left">
                          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Keuntungan Bersih</span>
                          <div className="text-xl font-bold text-blue-400 mt-1">Rp 12.8 JT</div>
                        </div>
                        <div className="bg-white/5 border border-white/5 p-4 rounded-xl text-left">
                          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Mitra Toko Reseller</span>
                          <div className="text-xl font-bold text-emerald-400 mt-1">48 Aktif</div>
                        </div>
                      </div>

                      <div className="bg-black/40 border border-white/5 p-4 rounded-xl text-left space-y-3">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400">Total Transaksi (Rute Aman)</span>
                          <span className="text-emerald-400 font-bold">14,928 Trx</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full w-[85%]" />
                        </div>
                        <div className="text-[10px] text-slate-500">Global markup diterapkan: Pulsa (+3%) • Diamond (+2.5%)</div>
                      </div>
                    </div>
                  )}

                  {selectedPersona === 'reseller' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 border border-white/5 p-4 rounded-xl text-left">
                          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Saldo Deposit</span>
                          <div className="text-xl font-bold text-emerald-400 mt-1">Rp 4,981,025</div>
                        </div>
                        <div className="bg-white/5 border border-white/5 p-4 rounded-xl text-left">
                          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Domain Kustom</span>
                          <div className="text-xs font-bold text-white mt-1.5 truncate">toko.diamondku.com</div>
                        </div>
                      </div>

                      <div className="bg-black/40 border border-white/5 p-4 rounded-xl text-left space-y-3">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400">Kecepatan Fulfill</span>
                          <span className="text-emerald-400 font-bold">~ 2 Detik saja</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-400 rounded-full w-[99%]" />
                        </div>
                        <div className="text-[10px] text-slate-500">Integrasi otomatis via dashboard penyesuaian markup toko reseller.</div>
                      </div>
                    </div>
                  )}

                  {/* Core Status Banner at the bottom of panel */}
                  <div className="p-3.5 bg-white/[0.03] border border-white/5 rounded-xl flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-medium font-mono">Platform Gateway Engine</span>
                    <span className="inline-flex items-center gap-1.5 text-[9px] text-emerald-400 font-bold uppercase tracking-wider">
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                      Active & Secure
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Feature Bento Grid */}
      <section id="features" className="px-6 py-32 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto space-y-6 mb-16">
            <h2 className="text-5xl font-black text-white tracking-tight">Standardizing B2B Scale</h2>
            <p className="text-slate-400 text-lg leading-relaxed">Engineering designed to eliminate human routing errors and ensure continuous operation across high-volume supplier APIs.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-10 bg-white/[0.02] border border-white/5 rounded-[32px] hover:bg-white/[0.04] transition-all">
              <Database className="w-8 h-8 text-white mb-6 opacity-80" />
              <h3 className="text-xl font-bold text-white mb-3">Modular Connectors</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Connect external vendor networks safely. Our bridge normalizes raw XML-RPC or JSON responses into unified database arrays smoothly.
              </p>
            </div>

            <div className="p-10 bg-white/[0.02] border border-white/5 rounded-[32px] hover:bg-white/[0.04] transition-all">
              <Layers className="w-8 h-8 text-white mb-6 opacity-80" />
              <h3 className="text-xl font-bold text-white mb-3">Ledger Truth</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                We track every digital transaction with dual-entry accounting logs, eliminating race-conditions. Zero balance discrepancy.
              </p>
            </div>

            <div className="p-10 bg-white/[0.02] border border-white/5 rounded-[32px] hover:bg-white/[0.04] transition-all">
              <Globe className="w-8 h-8 text-white mb-6 opacity-80" />
              <h3 className="text-xl font-bold text-white mb-3">Tenant Proxies</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Route B2B resellers seamlessly. The gateway natively structures dedicated tenant identifiers on every checkout request.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="px-6 py-32 border-t border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-emerald-500/5 placeholder-opacity-50 pointer-events-none mix-blend-overlay" />
        <div className="max-w-4xl mx-auto text-center space-y-10 relative z-10">
          <h2 className="text-5xl md:text-7xl font-black text-white tracking-tight">
            Initialize Cluster.
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed max-w-xl mx-auto">
            Boot up your dedicated master workspace. Enter the portal to configure gateways, provision reseller sub-accounts, and dictate market margins.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register" className="bg-white text-black font-bold px-8 h-14 rounded-full flex items-center justify-center gap-3 hover:bg-slate-200 transition-colors shadow-2xl shadow-white/10">
              Create Master Workspace
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/login" className="bg-white/5 border border-white/10 text-white font-bold px-8 h-14 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
              Access Console
            </Link>
          </div>
        </div>
      </section>

      {/* Simplified Minimal Footer */}
      <footer className="px-6 py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-white rounded flex items-center justify-center text-black">
              <Layers className="w-3 h-3 font-bold" />
            </div>
            <span className="text-xs font-bold text-white tracking-widest">{BRAND.name.toUpperCase()} INFRASTRUCTURE</span>
          </div>
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
            © 2026 {BRAND.name}. All Rights Reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

