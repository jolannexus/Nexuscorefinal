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
  Users,
  CreditCard,
  ArrowUpRight,
  UserCheck,
  Box,
  RefreshCw,
  Plus,
  Compass,
  Briefcase
} from 'lucide-react';
import { BRAND } from '../config/branding';
import { BrandLogo } from '../components/BrandLogo';

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
    <div className="min-h-screen bg-[#05070A] text-[#E2E8F0] font-sans antialiased selection:bg-blue-500/30 overflow-x-hidden">
      {/* High-End Ambient Lighting Fields - Simplified for Stability */}
      <div className="absolute top-[-10%] left-[-10%] w-[80%] h-[40%] bg-blue-500/[0.03] blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-[30%] right-[-5%] w-[40%] h-[40%] bg-[#00E5FF]/[0.02] blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[10%] left-[-5%] w-[30%] h-[30%] bg-[#8B5CF6]/[0.02] blur-[80px] rounded-full pointer-events-none" />

      {/* Corporate Header */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-[#05070A]/95 sm:bg-[#05070A]/85 sm:backdrop-blur-xl border-b border-white/[0.04] transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrandLogo className="w-9 h-9 drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]" />
            <div className="flex flex-col">
              <span className="text-sm font-extrabold uppercase tracking-[0.25em] text-white">NEXUSCORE</span>
              <span className="text-[9px] font-bold text-blue-400 tracking-[0.4em] uppercase leading-none -mt-0.5">NETWORK</span>
            </div>
          </div>
          
          <div className="hidden lg:flex items-center gap-8 text-xs font-semibold uppercase tracking-widest text-slate-400">
             <a href="#platform" className="hover:text-white transition-colors">Platform</a>
             <a href="#simulator" className="hover:text-white transition-colors">Solutions</a>
             <a href="#personas" className="hover:text-white transition-colors">Developers</a>
             <a href="#features" className="hover:text-white transition-colors">Company</a>
             <Link to="/brand-system" className="text-blue-400 hover:text-blue-300 transition-colors font-bold">Brand Identity</Link>
          </div>
          
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors hidden sm:block">
              Log In
            </Link>
            <Link to="/register" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-lg text-xs font-extrabold uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(37,99,235,0.25)] hover:shadow-[0_0_25px_rgba(37,99,235,0.45)]">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Strategic Hero Presentation & Infrastructure Ecosystem Diagram */}
      <section className="pt-32 lg:pt-48 pb-20 px-6 max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Block: Corporate Statement */}
          <div className="lg:col-span-6 space-y-8 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-mono tracking-[0.25em] text-cyan-400">
              <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
              NEXUSCORE HIGH-AVAILABILITY FABRIC [NCHF-v2]
            </div>
            
            <h1 className="text-[2.2rem] xs:text-4xl sm:text-5xl md:text-[5rem] font-black tracking-tight text-white leading-[1.05] font-display">
              Autonomous <br className="hidden xs:inline" />
              Settlement for <br className="hidden xs:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400">
                Digital Ecosystems.
              </span>
            </h1>
            
            <p className="text-slate-400 text-sm md:text-base font-normal leading-relaxed max-w-xl">
              The high-throughput payment execution, dynamic licensing orchestration, and synchronized ledger middleware trusted by global telecommunications networks and secure SaaS federations. Engine built to settle high-frequency volume safely.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
              <a href="#simulator" className="bg-blue-600 hover:bg-blue-500 text-white px-8 h-14 rounded-xl flex items-center justify-center gap-3 text-sm font-extrabold uppercase tracking-widest transition-all shadow-[0_0_25px_rgba(59,130,246,0.3)] w-full sm:w-auto">
                Explore Platform
                <ArrowRight className="w-4 h-4" />
              </a>
              <a href="#personas" className="px-8 h-14 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] text-white flex items-center justify-center text-sm font-bold uppercase tracking-widest transition-colors w-full sm:w-auto">
                Contact Sales
              </a>
            </div>
          </div>

          {/* Right Block: Overdesigned, Hyper-Detailed Infrastructure Architecture Blueprint (Large Desktop Only) */}
          <div className="hidden lg:flex lg:col-span-6 relative aspect-square w-full max-w-[530px] mx-auto items-center justify-center bg-[#03060A] border border-white/[0.04] rounded-3xl p-6 overflow-hidden shadow-[inset_0_0_50px_rgba(37,99,235,0.05)]">
            
            {/* Subtle, precise technical background grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.08)_0%,transparent_70%)] pointer-events-none" />
            
            {/* Architectural Grid Rulers and Coordinates */}
            <div className="absolute top-2 left-4 font-mono text-[8px] text-slate-600 tracking-widest select-none">GRID: NC_V1.0_PROD</div>
            <div className="absolute bottom-2 left-4 font-mono text-[8px] text-slate-600 tracking-widest select-none">COORD: [270.48, 110.92]</div>
            <div className="absolute top-2 right-4 font-mono text-[8px] text-emerald-500/50 tracking-widest select-none flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> NETWORK ACTIVE
            </div>

            {/* Simplified drawing lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 540 540">
              <defs>
                <linearGradient id="line-grad-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.4" />
                </linearGradient>
              </defs>
              
              {/* Concentric Calibration Circles - Reduced */}
              <circle cx="270" cy="270" r="190" stroke="#fffff" strokeWidth="0.5" strokeDasharray="2 12" fill="none" opacity="0.04" />
              <circle cx="270" cy="270" r="230" stroke="#00E5FF" strokeWidth="0.5" fill="none" opacity="0.02" />

              {/* Simplified alignment paths */}
              <path d="M 60,60 L 270,270 L 480,60" stroke="url(#line-grad-cyan)" strokeWidth="0.75" strokeDasharray="3 4" opacity="0.2" />
              <path d="M 270,30 L 270,510" stroke="#3B82F6" strokeWidth="0.5" strokeDasharray="5 15" opacity="0.1" />
            </svg>

            {/* Industrial Node 1: Payments Acquiring (Top-Left) */}
            <motion.div 
              whileHover={{ y: -2, borderColor: '#3B82F6' }}
              className="absolute left-[6%] top-[8%] z-20 flex flex-col items-start bg-[#080C14] border border-white/5 rounded-xl p-3.5 w-[140px] shadow-2xl transition-all"
            >
              <div className="flex items-center justify-between w-full mb-2">
                <span className="font-mono text-[7px] text-slate-500 font-bold tracking-widest uppercase">ACQUIRER_01</span>
                <span className="font-mono text-[8px] text-emerald-400 font-extrabold flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-emerald-400" /> ONLINE
                </span>
              </div>
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                  <CreditCard className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <div className="text-left">
                  <span className="text-[10px] font-extrabold text-white tracking-wide block">Payments</span>
                  <span className="text-[8px] text-slate-400 block -mt-0.5">Dual-auth route</span>
                </div>
              </div>
              <div className="w-full h-[3px] bg-slate-950 rounded-full overflow-hidden mt-1">
                <div className="h-full bg-blue-500 w-[94%]" />
              </div>
            </motion.div>

            {/* Industrial Node 2: Automated Payouts (Top-Right) */}
            <motion.div 
              whileHover={{ y: -2, borderColor: '#3B82F6' }}
              className="absolute right-[6%] top-[8%] z-20 flex flex-col items-start bg-[#080C14] border border-white/5 rounded-xl p-3.5 w-[140px] shadow-2xl transition-all"
            >
              <div className="flex items-center justify-between w-full mb-2">
                <span className="font-mono text-[7px] text-slate-500 font-bold tracking-widest uppercase">SETTLE_CH_02</span>
                <span className="font-mono text-[8px] text-cyan-400 font-extrabold">AUTO_DISP</span>
              </div>
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-7 h-7 rounded-lg bg-[#00E5FF]/10 border border-[#00E5FF]/20 flex items-center justify-center shrink-0">
                  <ArrowUpRight className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <div className="text-left">
                  <span className="text-[10px] font-extrabold text-white tracking-wide block">Payouts</span>
                  <span className="text-[8px] text-slate-400 block -mt-0.5">Instant settlement</span>
                </div>
              </div>
              <div className="w-full h-[3px] bg-slate-950 rounded-full overflow-hidden mt-1">
                <div className="h-full bg-[#00E5FF] w-[88%]" />
              </div>
            </motion.div>

            {/* Industrial Node 3: KYC identity checks (Middle-Left) */}
            <motion.div 
              whileHover={{ y: -2, borderColor: '#3B82F6' }}
              className="absolute -left-[2%] top-[41%] z-20 flex flex-col items-start bg-[#080C14] border border-white/5 rounded-xl p-3.5 w-[140px] shadow-2xl transition-all"
            >
              <div className="flex items-center justify-between w-full mb-2">
                <span className="font-mono text-[7px] text-slate-500 font-bold tracking-widest uppercase">AUTH_IDENTITY</span>
                <span className="font-mono text-[7px] text-slate-400 font-bold bg-white/5 px-1 py-0.2 rounded">PASS</span>
              </div>
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                  <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                </div>
                <div className="text-left">
                  <span className="text-[10px] font-extrabold text-white tracking-wide block">KYC / Identity</span>
                  <span className="text-[8px] text-slate-400 block -mt-0.5">Biometric sync</span>
                </div>
              </div>
            </motion.div>

            {/* Industrial Node 4: Dynamic Products (Middle-Right) */}
            <motion.div 
              whileHover={{ y: -2, borderColor: '#3B82F6' }}
              className="absolute -right-[2%] top-[41%] z-20 flex flex-col items-start bg-[#080C14] border border-white/5 rounded-xl p-3.5 w-[140px] shadow-2xl transition-all"
            >
              <div className="flex items-center justify-between w-full mb-2">
                <span className="font-mono text-[7px] text-slate-500 font-bold tracking-widest uppercase">CATALOG_SCHEM</span>
                <span className="font-mono text-[8px] text-blue-400 font-bold">MUTABLE</span>
              </div>
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                  <Box className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <div className="text-left">
                  <span className="text-[10px] font-extrabold text-white tracking-wide block">Digital Goods</span>
                  <span className="text-[8px] text-slate-400 block -mt-0.5">License engines</span>
                </div>
              </div>
            </motion.div>

            {/* Industrial Node 5: Billing & Ledgers (Bottom-Left) */}
            <motion.div 
              whileHover={{ y: -2, borderColor: '#3B82F6' }}
              className="absolute left-[6%] bottom-[8%] z-20 flex flex-col items-start bg-[#080C14] border border-white/5 rounded-xl p-3.5 w-[140px] shadow-2xl transition-all"
            >
              <div className="flex items-center justify-between w-full mb-2">
                <span className="font-mono text-[7px] text-slate-500 font-bold tracking-widest uppercase">DOUBLE_ACC_LEDG</span>
                <span className="font-mono text-[6px] text-slate-400 bg-white/5 px-1 py-0.2 rounded">IMMUT</span>
              </div>
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                  <RefreshCw className="w-3.5 h-3.5 text-purple-400" />
                </div>
                <div className="text-left">
                  <span className="text-[10px] font-extrabold text-white tracking-wide block">Ledger Billing</span>
                  <span className="text-[8px] text-slate-400 block -mt-0.5">Dunning active</span>
                </div>
              </div>
            </motion.div>

            {/* Industrial Node 6: Deep API Engine (Bottom-Right) */}
            <motion.div 
              whileHover={{ y: -2, borderColor: '#3B82F6' }}
              className="absolute right-[6%] bottom-[8%] z-20 flex flex-col items-start bg-[#080C14] border border-white/5 rounded-xl p-3.5 w-[140px] shadow-2xl transition-all"
            >
              <div className="flex items-center justify-between w-full mb-2">
                <span className="font-mono text-[7px] text-slate-500 font-bold tracking-widest uppercase">API_EDGE_PORT</span>
                <span className="font-mono text-[7px] text-[#00E5FF] font-bold">JWT_SECURE</span>
              </div>
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="text-left">
                  <span className="text-[10px] font-extrabold text-white tracking-wide block">Edge Gateway</span>
                  <span className="text-[8px] text-slate-400 block -mt-0.5">Micro-payload</span>
                </div>
              </div>
            </motion.div>

            {/* Central Master Industrial Slab Device - Simplified Animation */}
            <motion.div 
              className="w-48 h-48 rounded-4xl bg-[#07090F] border-2 border-blue-500/20 flex items-center justify-center p-5 relative z-10 shadow-lg select-none"
            >
              {/* Simplified decoration */}
              <div className="absolute inset-4 rounded-3xl border border-dashed border-cyan-500/10 pointer-events-none" />
              
              <div className="text-center flex flex-col items-center">
                <BrandLogo className="w-14 h-14 drop-shadow-[0_0_10px_rgba(0,229,255,0.2)] mb-1" />
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white">NEXUS CORE</span>
                <span className="text-[7px] font-bold text-cyan-400 tracking-[0.35em] uppercase opacity-90 mt-1">ORCHESTRATOR</span>
              </div>
            </motion.div>

          </div>

          {/* Right Block: Mobile-Optimized Enterprise-Grade Infrastructure Topology (Visible on Tablet/Mobile) */}
          <div className="flex lg:hidden flex-col items-center gap-6 w-full max-w-md mx-auto relative px-2">
            
            {/* Pulsing Ambient Background Glow for mobile */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Central Master Slab Device for mobile - Static */}
            <div 
              className="w-full max-w-[280px] rounded-3xl bg-[#0D131F] border-2 border-blue-500/20 flex flex-col items-center justify-center p-6 relative z-10 shadow-lg select-none text-center"
            >
              <BrandLogo className="w-12 h-12 drop-shadow-[0_0_10px_rgba(0,229,255,0.3)] mb-2 inline-block" />
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white block">NEXUSCORE DEPLOYMENT</span>
              <span className="text-[8px] font-bold text-cyan-400 tracking-[0.3em] uppercase opacity-80 mt-0.5 block">Core Orchestrator</span>
            </div>

            {/* Connector Graphic */}
            <div className="w-[2px] h-6 bg-gradient-to-b from-blue-500/50 to-white/[0.04]" />

            {/* Responsive Grid of Orbit Channels (6 Items in small beautiful cards) */}
            <div className="grid grid-cols-2 gap-3 w-full">
              {[
                { label: "Payments", icon: CreditCard, desc: "Global acquiring" },
                { label: "Payouts", icon: ArrowUpRight, desc: "Instantly routed" },
                { label: "KYC Check", icon: UserCheck, desc: "Onboard safely" },
                { label: "Products", icon: Box, desc: "Dynamic schemas" },
                { label: "Billing", icon: RefreshCw, desc: "Token ledgers" },
                { label: "API Infra", icon: Terminal, desc: "OpenAPI edge" }
              ].map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <div 
                    key={idx}
                    className="flex flex-col items-center text-center bg-[#070A0F]/90 backdrop-blur-md border border-white/5 rounded-2xl p-4 shadow-xl hover:border-blue-500/20 active:bg-white/[0.02] transition-all"
                  >
                    <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-2.5">
                      <IconComponent className="w-4.5 h-4.5 text-blue-400" />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#E2E8F0] block">{item.label}</span>
                    <span className="text-[8px] text-slate-500 font-semibold tracking-wider uppercase mt-1 block">{item.desc}</span>
                  </div>
                );
              })}
            </div>

          </div>

        </div>
      </section>

      {/* Corporate Social Proof - Grayscale minimal representation */}
      <section className="py-12 border-y border-white/[0.04] bg-[#030508]/40 relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4">
          <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-500 md:text-left text-center">
            Trusted by global orchestrators
          </span>
          <div className="flex flex-wrap justify-center md:justify-end items-center gap-x-12 gap-y-6">
            {[
              { name: 'Payrix', logo: 'AEGIS CLEAR ACQ' },
              { name: 'Scalev.', logo: 'PACIFIC BROADCAST' },
              { name: 'ByteFlow', logo: 'CYPHERNET SECURE' },
              { name: 'Cirion', logo: 'REDE COBRANÇA' },
              { name: 'Finova', logo: 'TELECOM INTL GROUP' }
            ].map((company) => (
              <span key={company.name} className="text-xs font-bold tracking-[0.15em] uppercase text-slate-500 hover:text-slate-300 transition-colors font-mono">
                {company.logo}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CORE PLATFORM SUMMARY: Everything you need */}
      <section id="platform" className="py-24 max-w-7xl mx-auto px-6 relative z-10 scroll-mt-20">
        <div className="text-left mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-blue-500">Our Platform</span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white max-w-3xl leading-tight font-display">
            Everything you need to build, scale, and operate.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: "White-Label Infrastructure",
              desc: "Launch corporate-grade solutions instantly with unified reselling, custom mappings, and complete API styling tools.",
              icon: Layers
            },
            {
              title: "Payment Orchestration",
              desc: "Intelligent dynamic transaction routing pathways automatically map the best cost matrices and assure premium checkouts.",
              icon: CreditCard
            },
            {
              title: "KYC & Compliance",
              desc: "Fully secure customer identity processing flow with built-in multi-tenant sandbox testing capabilities.",
              icon: UserCheck
            },
            {
              title: "Digital Products",
              desc: "A completely robust schema configuration for software licenses, bulk keys, accounts, and inventory processing systems.",
              icon: Box
            },
            {
              title: "Subscriptions & Billing",
              desc: "Enterprise custom billing engine offering flexible subscription contracts, tokenized ledgers, and automated dunning.",
              icon: RefreshCw
            },
            {
              title: "Powerful API",
              desc: "Complete developer-first OpenAPI specifications with fast sandbox response variables and zero integration friction.",
              icon: Terminal
            }
          ].map((item, index) => (
            <div key={index} className="bg-[#090D14]/60 border border-white/[0.04] rounded-2xl p-8 hover:bg-[#0E1421]/90 transition-all duration-300 group hover:border-blue-500/20">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <item.icon className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-base font-bold text-white mb-3 tracking-wide">{item.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed font-normal">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CORE SANDBOX INTERACTIVE SIMULATOR (Highly Premium Layout) */}
      <section id="simulator" className="py-24 border-y border-white/[0.04] bg-[#03060A]/80 relative z-30 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-4 mb-16">
            <span className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-blue-500">Interactive Diagnostic Engine</span>
            <h2 className="text-4xl font-bold tracking-tight text-white font-display max-w-2xl mx-auto">
              Simulate Dynamic Orchestration
            </h2>
            <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto">
              Inspect our mathematical failover latency table and transaction escrow state model inside this real-time simulator.
            </p>
          </div>

          <div className="rounded-3xl border border-white/[0.05] bg-[#070B11] p-1.5 shadow-2xl relative overflow-hidden">
            
            {/* Simulator Control Tabs */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between border-b border-white/[0.04] p-6 gap-4 bg-[#090D15]/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <Terminal className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white uppercase tracking-wider">Gateway Telemetry</div>
                  <div className="text-[10px] text-blue-400 font-semibold mt-0.5 font-mono">CLUSTER://NEXUS_ENGINE_PRIMARY</div>
                </div>
              </div>

              <div className="flex bg-white/5 p-1 rounded-xl border border-white/5 w-full md:w-auto overflow-x-auto md:overflow-visible scrollbar-none shrink-0 gap-1">
                {[
                  { id: 'failover', label: 'Failover Pathing', icon: Cpu },
                  { id: 'valuation', label: 'SaaS Asset Value', icon: DollarSign },
                  { id: 'audit', label: 'Compliance Audit', icon: FileCheck },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center justify-center gap-1.5 px-3 md:px-4 py-2.5 rounded-lg text-[9px] sm:text-[10px] uppercase tracking-widest font-extrabold transition-all cursor-pointer whitespace-nowrap flex-1 md:flex-initial ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                        : 'text-slate-400 hover:text-white hover:bg-white/[0.03]'
                    }`}
                  >
                    <tab.icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
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
                    <div className="bg-white/[0.02] border border-white/[0.04] rounded-2xl p-6 space-y-4">
                      <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest block">Trigger Routing Event</span>
                      
                      <div className="space-y-3">
                        <button
                          onClick={executeNormalOrder}
                          disabled={simStep > 0}
                          className="w-full flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all group disabled:opacity-40 cursor-pointer"
                        >
                          <div className="text-left">
                            <div className="text-xs font-bold text-white tracking-wide">Nominal API Pathway</div>
                            <div className="text-[9px] text-blue-400 font-bold uppercase tracking-wider mt-1">Route: Digiflazz (Primary)</div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                        </button>

                        <button
                          onClick={executeFailoverOrder}
                          disabled={simStep > 0}
                          className="w-full flex items-center justify-between p-4 rounded-xl border border-red-500/10 bg-red-500/[0.03] hover:bg-red-500/[0.08] transition-all group disabled:opacity-40 cursor-pointer"
                        >
                          <div className="text-left">
                            <div className="text-xs font-bold text-red-400 tracking-wide">Trigger Fault Failover</div>
                            <div className="text-[9px] text-red-300 font-bold uppercase tracking-wider mt-1">Simulate 503 Outage</div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-red-400 group-hover:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </div>

                    {/* Ledger Escrow HUD */}
                    <div className="bg-[#05080E] border border-white/[0.04] rounded-2xl p-6 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-5">
                         <Lock className="w-20 h-20 text-white" />
                      </div>
                      
                      <div className="flex items-center justify-between mb-6 relative z-10">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Double-Entry Balance</span>
                        <span className="text-[9px] bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full font-extrabold uppercase">reconciled state</span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 relative z-10">
                        <div>
                          <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Reseller Balance</div>
                          <div className="text-base font-bold text-white mt-1 font-mono">Rp {resellerWallet.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Active Escrow Hold</div>
                          <div className={`text-base font-bold mt-1 font-mono ${escrowAmount > 0 ? 'text-amber-400' : 'text-slate-500'}`}>
                            Rp {escrowAmount.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Flow Visualization & Log Output */}
                  <div className="lg:col-span-8 flex flex-col gap-6">
                    
                    {/* Live Diagram Box */}
                    <div className="bg-[#04060A] border border-white/[0.04] rounded-2xl p-8 relative min-h-[220px] flex items-center justify-center overflow-hidden">
                      <div className="absolute top-6 left-6 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <Server className="w-3.5 h-3.5 text-blue-500" /> Pipeline Topology Visualizer
                      </div>

                      {/* Diagnostic Node Mapping */}
                      <div className="w-full flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 relative z-10 mt-6">
                        {/* Core Server Node */}
                        <div className="flex flex-col items-center text-center">
                          <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-4 shadow-md relative">
                            <Layers className="w-6 h-6" />
                          </div>
                          <div className="text-xs font-bold text-white">NEXUS CORE SYSTEM</div>
                        </div>

                        {/* Connection Lines Container */}
                        <div className="hidden md:flex flex-col gap-6 w-32 relative">
                           {/* Primary Line */}
                           <div className={`h-1 rounded-full w-full transition-all duration-300 ${simStep >= 3 ? (simProvider1 === 'quarantined' ? 'bg-red-500' : 'bg-blue-500') : 'bg-slate-800'}`} />
                           {/* Secondary Line */}
                           <div className={`h-1 rounded-full w-full transition-all duration-300 ${simProvider2 !== 'idle' ? 'bg-blue-500' : 'bg-slate-800'}`} />
                        </div>

                        {/* Providers */}
                        <div className="flex flex-col gap-5">
                          {/* Provider 1 */}
                          <div className={`flex items-center gap-4 p-4 rounded-xl border ${simProvider1 === 'quarantined' ? 'border-red-500/35 bg-red-500/[0.05]' : 'border-white/[0.05] bg-white/[0.01]'} min-w-[210px]`}>
                            <Activity className={`w-5 h-5 ${simProvider1 === 'quarantined' ? 'text-red-400' : 'text-slate-400'}`} />
                            <div>
                              <div className="text-xs font-bold text-white flex items-center gap-2">
                                Primary Route 
                                {simProvider1 === 'quarantined' && <span className="bg-red-500/10 text-red-400 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase">Outage</span>}
                              </div>
                              <div className="text-[10px] text-slate-400 mt-0.5 font-mono">Digiflazz API Handler</div>
                            </div>
                          </div>
                          {/* Provider 2 */}
                          <div className={`flex items-center gap-4 p-4 rounded-xl border ${simProvider2 === 'success' ? 'border-blue-500/30 bg-blue-500/[0.05]' : 'border-white/[0.05] bg-white/[0.01]'} min-w-[210px]`}>
                            <Cpu className={`w-5 h-5 ${simProvider2 === 'success' ? 'text-blue-400' : 'text-slate-400'}`} />
                            <div>
                              <div className="text-xs font-bold text-white flex items-center gap-2">
                                Fallback Channel
                                {simProvider2 === 'success' && <span className="bg-blue-500/15 text-blue-400 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase">Active</span>}
                              </div>
                              <div className="text-[10px] text-slate-400 mt-0.5 font-mono">VIP Reseller API Handler</div>
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Console Output */}
                    <div className="bg-[#040609] border border-white/[0.05] rounded-2xl p-6 flex-1 flex flex-col relative overflow-hidden">
                      <div className="flex items-center justify-between border-b border-white/[0.04] pb-4 mb-4">
                        <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                          <Terminal className="w-3.5 h-3.5 text-slate-400" /> Kernel Execution Stream
                        </span>
                        <button
                          onClick={resetSimulator}
                          className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 hover:text-white transition-colors bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/5 cursor-pointer"
                        >
                          Clear Stream
                        </button>
                      </div>

                      <div className="flex-1 overflow-y-auto space-y-2 h-[120px] pr-2 scrollbar-thin scrollbar-thumb-white/10 font-mono text-xs text-left">
                        {simLogs.map((log, idx) => (
                          <div key={idx} className="leading-relaxed">
                            {log.includes('SUCCESS') || log.includes('LEDGER RECONCILED') ? (
                              <span className="text-blue-400 font-semibold">{log}</span>
                            ) : log.includes('CRITICAL OUTAGE') || log.includes('QUARANTINE') ? (
                              <span className="text-red-400 font-semibold">{log}</span>
                            ) : log.includes('ESCROW HELD') || log.includes('FAILOVER ACTIVE') ? (
                              <span className="text-amber-400 font-semibold">{log}</span>
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

              {/* TAB CONTENT: 2. SaaS ASSET VALUE */}
              {activeTab === 'valuation' && (
                <motion.div
                  key="valuation"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-8 space-y-8"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 border border-white/[0.03] bg-white/[0.01] rounded-2xl">
                      <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6 border border-blue-500/20">
                        <Globe className="w-5 h-5 text-blue-400" />
                      </div>
                      <h3 className="text-sm font-bold text-white mb-2 uppercase tracking-wider">Multi-Tenant Routing</h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Host headers intelligently handle thousands of downstream merchant storefront configurations on wildcard domains instantly.
                      </p>
                    </div>

                    <div className="p-6 border border-white/[0.03] bg-white/[0.01] rounded-2xl">
                      <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6 border border-blue-500/20">
                        <ShieldCheck className="w-5 h-5 text-blue-400" />
                      </div>
                      <h3 className="text-sm font-bold text-white mb-2 uppercase tracking-wider">Double-Entry Accounting</h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        DB transaction-level locking ensures that absolute balance modifications map precisely. No trace duplicates.
                      </p>
                    </div>

                    <div className="p-6 border border-white/[0.03] bg-white/[0.01] rounded-2xl">
                      <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6 border border-blue-500/20">
                        <Cpu className="w-5 h-5 text-blue-400" />
                      </div>
                      <h3 className="text-sm font-bold text-white mb-2 uppercase tracking-wider">Auto-Quarantine Isolation</h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Continuous latency testing isolates unresponsive payment adapters and redirects transactions in milliseconds.
                      </p>
                    </div>
                  </div>

                  <div className="p-8 border border-white/[0.05] bg-white/[0.02] rounded-2xl flex flex-col md:flex-row items-center justify-between gap-8 text-left">
                    <div className="max-w-2xl">
                      <span className="text-[9px] font-extrabold text-blue-400 uppercase tracking-[0.2em] mb-2 block">Enterprise Blueprint Valuation</span>
                      <h3 className="text-xl font-bold text-white mb-2 tracking-wide">Enterprise Infrastructure Platform Asset</h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Mitigates several thousand operational staff and engineering hours into modular core code architecture ready for serious distribution scale.
                      </p>
                    </div>
                    <div className="shrink-0">
                      <div className="text-3xl font-black text-white px-8 py-4 bg-black rounded-xl border border-white/[0.08] shadow-xl font-mono">
                         $50,000+
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB CONTENT: 3. COMPLIANCE CHECKLIST */}
              {activeTab === 'audit' && (
                <motion.div
                  key="audit"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  <div className="bg-white/[0.01] border border-white/[0.03] rounded-2xl p-6 text-left">
                     <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-6 border-b border-white/[0.04] pb-4">Compliance Status Checklist</h4>
                     <div className="space-y-4">
                        {[
                          'Strict TypeScript Compiler Settings (Null checks active)',
                          'Bilateral Security Token Authentication Model',
                          'Immutable Double-Entry Ledger Logs Database verified',
                          'Adaptive Downstream Adapter Outage Isolator enabled',
                          'Enterprise Access Control & JWT blacklist tables',
                        ].map((item, i) => (
                          <div key={i} className="flex items-start gap-4">
                             <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                             <span className="text-xs text-slate-300 font-normal">{item}</span>
                          </div>
                        ))}
                     </div>
                  </div>

                  <div className="bg-white/[0.01] border border-white/[0.03] rounded-2xl p-6 text-left">
                     <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-6 border-b border-white/[0.04] pb-4">Deploy Audit Metadata</h4>
                     
                     <div className="space-y-6">
                        <div className="flex items-center gap-4 bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl">
                          <Activity className="w-5 h-5 text-blue-400 shrink-0" />
                          <div>
                            <div className="text-xs font-bold text-white uppercase tracking-wider">Production Sandbox Build Verified</div>
                            <div className="text-[10px] text-slate-400 mt-1 leading-relaxed">No compliance alerts detected. Ready for immediate tenant staging operations.</div>
                          </div>
                        </div>

                        <div className="text-xs text-slate-400 leading-relaxed">
                          <strong className="text-white block mb-1">Staging Instructions:</strong>
                          Before initializing actual financial collections, configure secure secret endpoints inside your Super Admin controller parameters.
                        </div>
                     </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ----------------- SELECTION FOR GATEWAY INDIVIDUALS ----------------- */}
      <section id="personas" className="py-24 max-w-7xl mx-auto px-6 relative z-10 scroll-mt-20">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-blue-500">Multitenancy Ecosystem Paths</span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white font-display">
            Specialized Gateways for Every Player
          </h2>
          <p className="text-slate-400 text-sm md:text-base leading-relaxed">
            NexusCore Network structures seamless interactions between high-volume API Suppliers, Platform Operators, and downstream Resellers with zero friction.
          </p>
        </div>

        {/* Persona selector tabs */}
        <div className="flex justify-center p-1 bg-white/5 border border-white/10 rounded-2xl max-w-lg mx-auto mb-12 shadow-inner">
          {[
            { id: 'supplier', label: 'Supplier API', icon: Building },
            { id: 'agency', label: 'Agency Hub', icon: Users },
            { id: 'reseller', label: 'Reseller Portal', icon: Store },
          ].map((persona) => (
            <button
              key={persona.id}
              onClick={() => setSelectedPersona(persona.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                selectedPersona === persona.id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 scale-[1.01]'
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
            className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch bg-[#070B13]/40 border border-white/10 rounded-3xl p-6 md:p-12 relative overflow-hidden shadow-2xl text-left"
          >
            {/* Left Column: Descriptive texts & checkmarks */}
            <div className="lg:col-span-6 flex flex-col justify-between relative z-10 space-y-8">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <span className="text-[9px] uppercase font-bold tracking-widest px-2.5 py-1 bg-white/5 border border-white/10 text-slate-300 rounded">
                    Ecosystem Gateway Access
                  </span>
                </div>

                {selectedPersona === 'supplier' && (
                  <>
                    <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight leading-tight">
                      Distribute Digital Products & API Assets Globally
                    </h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      For upstream virtual product suppliers, NexusCore Network serves as an ultra-efficient distribution tunnel. Route game credits, utility payments, and mobile products to thousands of networks with automated telemetry callbacks.
                    </p>
                  </>
                )}

                {selectedPersona === 'agency' && (
                  <>
                    <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight leading-tight">
                      Complete Administration, White-Label Staging & Multi-Tenant Stacks
                    </h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      As the platform master proxy owner, you maintain final jurisdiction. Program markup matrices globally, map specific wildcard domains, configure security policies, and manage downstream merchants under your company brand.
                    </p>
                  </>
                )}

                {selectedPersona === 'reseller' && (
                  <>
                    <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight leading-tight">
                      Instant White-Label Storefronts Without Deep Technical Overhead
                    </h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      Merchants and retail partners can launch beautiful top-up websites matching their specific brand style. Maintain balances safely, customize catalogs instantly, and enjoy lightning-fast payment settlements.
                    </p>
                  </>
                )}
              </div>

              {/* Checklist Bullet Points */}
              <div className="grid grid-cols-1 gap-3.5 pt-4">
                {selectedPersona === 'supplier' && [
                  'Automatic Webhook callback reconciliation with downstreams.',
                  'Real-time endpoint latency charts and circuit breakers.',
                  'Bulk queuing middleware handles heavy API payload surges.',
                  'Asset stock monitoring with developer webhook warnings.'
                ].map((feat, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3 h-3" />
                    </div>
                    <span className="text-xs text-slate-300">{feat}</span>
                  </div>
                ))}

                {selectedPersona === 'agency' && [
                  'Granular profit margin controls per partner class.',
                  'Wildcard DNS mapping creates reseller stores automatically.',
                  'Full log trails detail all internal master balance updates.',
                  'Immutable Double-Entry Ledger structures prevents security duplicates.'
                ].map((feat, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3 h-3" />
                    </div>
                    <span className="text-xs text-slate-300">{feat}</span>
                  </div>
                ))}

                {selectedPersona === 'reseller' && [
                  'Modern frontend templates render beautifully on all formats.',
                  'Instant ledger access with centralized balance top-ups.',
                  'Custom ticket routing maps inquiries to master operators.',
                  'Self-serve merchant controller parameters for fast operations.'
                ].map((feat, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3 h-3" />
                    </div>
                    <span className="text-xs text-slate-300">{feat}</span>
                  </div>
                ))}
              </div>

              {/* Quick CTA inside panel */}
              <div className="pt-6">
                <Link
                  to="/register"
                  className="bg-blue-600 hover:bg-blue-500 text-white inline-flex items-center gap-2.5 px-6 py-3 rounded-xl text-xs font-extrabold uppercase tracking-widest transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  <span>Register Staging Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right Column: Visual HUD / Dynamic Mock Dashboard Preview */}
            <div className="lg:col-span-6 flex items-center justify-center relative">
              <div className="w-full bg-[#05070B] border border-white/10 rounded-2xl p-6 md:p-8 space-y-6 relative z-10 shadow-2xl text-left">
                {/* Mock Window Header */}
                <div className="flex items-center justify-between border-b border-white/[0.04] pb-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500/70" />
                  </div>
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">{selectedPersona.toUpperCase()} CORE PORT LOGS</span>
                </div>

                {/* Dynamic Metrics HUD according to selection */}
                {selectedPersona === 'supplier' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/5 border border-white/5 p-4 rounded-xl">
                        <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Interface Latency</span>
                        <div className="text-lg font-bold text-blue-400 mt-1 font-mono">104 ms</div>
                      </div>
                      <div className="bg-white/5 border border-white/5 p-4 rounded-xl">
                        <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Gateway Uptime</span>
                        <div className="text-lg font-bold text-emerald-400 mt-1 font-mono">99.98%</div>
                      </div>
                    </div>

                    <div className="bg-[#080D15] border border-white/5 p-4 rounded-xl space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">REST Downstream API Staging</span>
                        <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded text-[9px] font-bold uppercase font-mono">active</span>
                      </div>
                      <div className="h-1 tracking-widest w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full w-[94%]" />
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">CALLBACK RECV: ML-DF-928198 [STATUS: SUCCESS]</div>
                    </div>
                  </div>
                )}

                {selectedPersona === 'agency' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/5 border border-white/5 p-4 rounded-xl">
                        <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Net Margin Stash</span>
                        <div className="text-lg font-bold text-blue-400 mt-1 font-mono">Rp 12.8 JT</div>
                      </div>
                      <div className="bg-white/5 border border-white/5 p-4 rounded-xl">
                        <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Active Merchants</span>
                        <div className="text-lg font-bold text-white mt-1 font-mono">48 Active</div>
                      </div>
                    </div>

                    <div className="bg-[#080D15] border border-white/5 p-4 rounded-xl space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">Total Volume Monitored</span>
                        <span className="text-blue-400 font-bold font-mono">14,928 Trx</span>
                      </div>
                      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full w-[85%]" />
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">Rule active: Global Diamond pricing mark +2.5%</div>
                    </div>
                  </div>
                )}

                {selectedPersona === 'reseller' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/5 border border-white/5 p-4 rounded-xl">
                        <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Merchant Balance</span>
                        <div className="text-lg font-bold text-white mt-1 font-mono">Rp 4,981,025</div>
                      </div>
                      <div className="bg-white/5 border border-white/5 p-4 rounded-xl">
                        <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider font-mono">store.domain</span>
                        <div className="text-xs font-bold text-blue-400 mt-1.5 truncate font-mono">toko.games.com</div>
                      </div>
                    </div>

                    <div className="bg-[#080D15] border border-white/5 p-4 rounded-xl space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">Transaction Stellate Time</span>
                        <span className="text-blue-400 font-bold font-mono">~2 Seconds</span>
                      </div>
                      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full w-[99%]" />
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">Staging storefront templates rendered on absolute Edge node</div>
                    </div>
                  </div>
                )}

                {/* Core Status Banner at the bottom of panel */}
                <div className="p-3.5 bg-white/[0.03] border border-white/5 rounded-xl flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-semibold font-mono">Orchestration Cluster Staging</span>
                  <span className="inline-flex items-center gap-1.5 text-[9px] text-blue-400 font-bold uppercase tracking-wider font-mono">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
                    SECURED PORT
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </section>

      {/* BUILT FOR SCALE SECTION (With metrics grid of 4 as shown in options) */}
      <section className="py-24 max-w-7xl mx-auto px-6 relative z-10 border-t border-white/[0.04]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Description Block */}
          <div className="lg:col-span-5 text-left space-y-6">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-blue-500">Built for Scale</span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white leading-tight font-display">
              Enterprise-grade infrastructure you can rely on.
            </h2>
            <p className="text-slate-400 text-sm md:text-base leading-relaxed">
              Our hardware clusters, network links, and redundant edge node servers represent global-level financial compliance architecture designed to never fail.
            </p>
            <div className="pt-2">
              <a href="#simulator" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] text-xs font-extrabold uppercase tracking-widest text-[#E2E8F0] transition-colors cursor-pointer">
                View System Status
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shrink-0 ml-1" />
              </a>
            </div>
          </div>

          {/* Right Metrics Cards Area */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
            {[
              {
                metric: "99.99%",
                label: "Uptime SLA",
                desc: "Enterprise reliability guarantee backed by mathematical adapter redundancy."
              },
              {
                metric: "150+",
                label: "Countries Supported",
                desc: "Seamless global localization matrix with modular custom pricing arrays."
              },
              {
                metric: "10M+",
                label: "Daily Dispatch Volume",
                desc: "Capable of handling heavy concurrent callback surges without drops."
              },
              {
                metric: "256-bit",
                label: "Enforced Security",
                desc: "Complete end-to-end payload signature hashing and database ledger audit blocks."
              }
            ].map((item, index) => (
              <div key={index} className="bg-[#090D14]/60 border border-white/[0.04] rounded-2xl p-6 relative overflow-hidden group hover:border-blue-500/20 transition-all duration-300">
                <div className="text-3xl font-extrabold text-white mb-2 font-mono tracking-tight">{item.metric}</div>
                <div className="text-xs font-extrabold text-blue-400 uppercase tracking-widest mb-1">{item.label}</div>
                <p className="text-xs text-slate-400 leading-relaxed font-normal">{item.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* CTA Block */}
      <section className="py-28 bg-gradient-to-t from-[#020407] to-transparent relative overflow-hidden border-t border-white/[0.04] text-center">
        <div className="absolute inset-0 bg-blue-500/[0.01] pointer-events-none" />
        <div className="max-w-4xl mx-auto px-6 space-y-8 relative z-10">
          <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tight leading-tight max-w-2xl mx-auto font-display">
            Ready to Initialize Your Production Cluster?
          </h2>
          <p className="text-slate-400 text-sm md:text-base leading-relaxed max-w-lg mx-auto">
            Boot up your secure master tenant control board. Enter the workspace to bind API pathways and design storefront channels.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
            <Link to="/register" className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs uppercase tracking-widest px-8 h-12 rounded-xl flex items-center justify-center gap-3 transition-colors shadow-2xl shadow-blue-500/20 cursor-pointer">
              Create Master Workspace
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/login" className="bg-white/5 border border-white/10 hover:bg-white/10 text-white font-extrabold text-xs uppercase tracking-widest px-8 h-12 rounded-xl flex items-center justify-center transition-colors cursor-pointer">
              Access Console
            </Link>
          </div>
        </div>
      </section>

      {/* Simplified, Professional Infrastructure Footer */}
      <footer className="py-12 border-t border-white/[0.04] bg-[#030508]/60 relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <BrandLogo className="w-6 h-6 grayscale opacity-80" />
            <span className="text-xs font-bold text-slate-400 tracking-widest font-mono">NEXUSCORE NETWORK INFRASTRUCTURE</span>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
            <Link to="/brand-system" className="text-blue-400 hover:text-blue-300 transition-colors">Interactive Brand System</Link>
            <span className="hidden sm:inline">•</span>
            <span>© 2026 {BRAND.name}. All Rights Reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
