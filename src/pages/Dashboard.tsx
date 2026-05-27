import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/Card';
import { 
  TrendingUp, 
  Activity, 
  Zap, 
  ShieldCheck, 
  Package, 
  Users, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCcw,
  Plus,
  CreditCard,
  History,
  LifeBuoy,
  Cpu,
  LayoutDashboard,
  ExternalLink,
  Settings,
  Globe,
  Palette,
  Download,
  Terminal
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BRAND } from '../config/branding';
import { cn } from '../utils/cn';
import { Storefront } from '../modules/Reseller/Storefront';
import { TopUpForm } from '../modules/Reseller/TopUpForm';
import { Transaction, Order, Reseller, Wallet } from '../types/index';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { BrandingManager } from '../modules/Reseller/BrandingManager';
import { resellerService } from '../services/resellers/resellerService';
import { useSuppliers } from '../hooks/useSuppliers';
import { diagnostics } from '../utils/diagnostics';
import { BalanceAlerts } from '../modules/System/BalanceAlerts';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { time: '00:00', value: 120 },
  { time: '03:00', value: 180 },
  { time: '06:00', value: 300 },
  { time: '09:00', value: 450 },
  { time: '12:00', value: 700 },
  { time: '15:00', value: 950 },
  { time: '18:00', value: 1200 },
  { time: '21:00', value: 850 },
  { time: '24:00', value: 420 },
];

const RevenueChart = () => (
  <ResponsiveContainer width="100%" height="100%">
    <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
      <defs>
        <linearGradient id="colorRevData" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
      <XAxis dataKey="time" stroke="rgba(255,255,255,0.2)" fontSize={12} tickLine={false} axisLine={false} />
      <YAxis stroke="rgba(255,255,255,0.2)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}M`} />
      <Tooltip 
        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
        itemStyle={{ color: '#10b981' }}
        formatter={(value: number) => [`${value}M`, 'Volume']}
      />
      <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevData)" />
    </AreaChart>
  </ResponsiveContainer>
);

const StatCard = ({ label, value, trend, icon: Icon, trendUp }: any) => (
  <Card className="bg-slate-900 border border-white/10 shadow-lg transition-all hover:border-white/[0.2]">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2.5 bg-slate-850 rounded-xl border border-white/15">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      {trend && (
        <div className={cn(
          "flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg",
          trendUp ? "text-emerald-400 bg-emerald-400/10" : "text-red-400 bg-red-400/10"
        )}>
          {trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {trend}
        </div>
      )}
    </div>
    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">{label}</p>
    <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
  </Card>
);

import { OnboardingWidget } from '../components/dashboard/OnboardingWidget';

export const Dashboard = () => {
  diagnostics.logRender('Dashboard');
  const navigate = useNavigate();
  const { user, role, profile } = useAuth();
  const { connections, loading: suppliersLoading } = useSuppliers();
  const [showTopUp, setShowTopUp] = React.useState(false);
  const [showBranding, setShowBranding] = React.useState(false);

  const { data: stats, isLoading: loading } = useDashboardStats();

  const walletData = { balance: stats?.resellerBalance || 0 } as Wallet;
  const resellerData = { 
    id: profile?.uid || 'demo', 
    name: profile?.displayName || 'Partner', 
    status: 'ACTIVE',
    branding: null 
  } as Reseller;
  const recentOrders = stats?.recentOrders || [];
  const recentTransactions = stats?.recentTransactions || [];

  const handleBrandingUpdate = async (branding: NonNullable<Reseller['branding']>) => {
    // API mutation goes here
  };

  if (role === 'AGENCY_SUPPLIER_ADMIN') {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8 md:space-y-12"
      >
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 md:gap-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
              Service Adapter Console
            </h2>
            <p className="text-[13px] text-slate-500 font-medium mt-1">
              Status: <span className="text-emerald-500">Online</span> &bull; Role: <span className="text-amber-400 font-semibold">Agency Supplier Administrator</span>
            </p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => navigate('/suppliers')}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-bold uppercase tracking-wider text-white transition-all shadow-[0_0_20px_rgba(37,99,235,0.15)] active:scale-95"
            >
              Configure Adapters
            </button>
            <div className="flex items-center gap-2.5 px-4 py-2 bg-emerald-500/[0.03] border border-emerald-500/10 rounded-xl">
               <ShieldCheck className="w-4 h-4 text-emerald-500" />
               <div className="flex flex-col justify-center">
                 <p className="text-[10px] font-bold text-emerald-500/70 uppercase tracking-widest leading-none">Integrity</p>
                 <p className="text-xs text-white font-medium mt-0.5 leading-none">Verified</p>
               </div>
            </div>
          </div>
        </div>

        {/* Informative Alert box */}
        <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-start gap-3.5">
          <Activity className="w-5 h-5 text-emerald-400 mt-0.5" />
          <div className="space-y-1">
            <p className="text-xs font-bold text-white uppercase tracking-wider">Access Scope Restricted</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your administrative credentials are mapped exclusively to <strong>Fulfillment Adapter Configurations</strong> and <strong>Supplier Health Monitoring</strong>. 
              Billing ledgers, financial journal audits, and payment transaction summaries are suppressed in adherence to data classification protocols.
            </p>
          </div>
        </div>

        {/* Micro-metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-slate-900 border border-white/10 shadow-lg p-5">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2.5 bg-slate-850 rounded-xl border border-white/15">
                <Cpu className="w-5 h-5 text-blue-400" />
              </div>
            </div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Fulfillment Nodes</p>
            <p className="text-2xl font-bold text-white tracking-tight">{connections.length}</p>
          </Card>
          
          <Card className="bg-slate-900 border border-white/10 shadow-lg p-5">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2.5 bg-slate-850 rounded-xl border border-white/15">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Active Connectors</p>
            <p className="text-2xl font-bold text-white tracking-tight">
              {connections.filter(c => c.status === 'ACTIVE').length} / {connections.length}
            </p>
          </Card>

          <Card className="bg-slate-900 border border-white/10 shadow-lg p-5">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2.5 bg-slate-850 rounded-xl border border-white/15">
                <Activity className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Global Health Index</p>
            <p className="text-2xl font-bold text-white tracking-tight">
              {connections.length > 0 
                ? `${(connections.reduce((acc, c) => acc + (c.successRate || 100), 0) / connections.length).toFixed(1)}%`
                : '100%'}
            </p>
          </Card>

          <Card className="bg-slate-900 border border-white/10 shadow-lg p-5">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2.5 bg-slate-850 rounded-xl border border-white/15">
                <Clock className="w-5 h-5 text-purple-400" />
              </div>
            </div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Average Service Latency</p>
            <p className="text-2xl font-bold text-white tracking-tight">
              {connections.length > 0 
                ? `${Math.round(connections.reduce((acc, c) => acc + (c.avgResponseTime || 280), 0) / connections.length)}ms`
                : '280ms'}
            </p>
          </Card>
        </div>

        {/* Supplier Connections list & Logs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card title="Adapter Integration Health" subtitle="Live state of connected fulfillment sources">
              {suppliersLoading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                </div>
              ) : connections.length === 0 ? (
                <div className="p-8 text-center bg-white/[0.01] border border-white/5 rounded-2xl">
                  <Cpu className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                  <p className="text-xs text-slate-400 font-semibold mb-2">No Connected Adapters Found</p>
                  <button 
                    onClick={() => navigate('/suppliers')}
                    className="mt-2 text-xs text-blue-400 hover:text-blue-300 font-bold underline"
                  >
                    Setup your first adapter connection
                  </button>
                </div>
              ) : (
                <div className="space-y-4 mt-4">
                  {connections.map((conn) => (
                    <div 
                      key={conn.id} 
                      className="p-4 rounded-xl border border-white/5 bg-black/20 hover:bg-white/[0.02] transition-all flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-white/5 rounded-lg border border-white/10 text-slate-400">
                          <Cpu className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white uppercase tracking-wider">{conn.supplierName}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                              conn.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-rose-500'
                            }`} />
                            <span className="text-[10px] text-slate-500 uppercase font-semibold tracking-widest">{conn.status}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right hidden sm:block">
                          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest leading-none mb-1">Latency</p>
                          <p className="text-xs font-semibold text-white tracking-tight leading-none">{conn.avgResponseTime || 280}ms</p>
                        </div>
                        <div className="text-right hidden sm:block">
                          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest leading-none mb-1">Success Rate</p>
                          <p className="text-xs font-semibold text-white tracking-tight leading-none">{conn.successRate || 100}%</p>
                        </div>
                        <button 
                          onClick={() => navigate('/suppliers')}
                          className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[11px] font-semibold text-slate-300 border border-white/10"
                        >
                          Configure
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          <div className="space-y-6">
            <Card title="Live Adapter Activity Logs" subtitle="Supplier monitoring audit trail">
              <div className="space-y-4 mt-4">
                {[
                  { time: '20:45:12', event: 'Diagnostics Executed', target: 'Digiflazz Node', status: 'Success' },
                  { time: '19:12:05', event: 'Adapter Synced', target: 'Apigames Multi', status: 'Success' },
                  { time: '18:55:30', event: 'API Credentials Validated', target: 'Digiflazz Node', status: 'Success' },
                  { time: '16:40:11', event: 'Product Catalog Refreshed', target: 'Internal DB', status: 'Optimal' }
                ].map((act, idx) => (
                  <div key={idx} className="flex items-start justify-between py-2 border-b border-white/5 last:border-0">
                    <div>
                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{act.time}</span>
                      <p className="text-xs font-semibold text-slate-200 mt-1">{act.event}</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">{act.target}</p>
                    </div>
                    <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold px-2 py-0.5 rounded-md uppercase tracking-wider">{act.status}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </motion.div>
    );
  }

  if (role === 'RESELLER' || role === 'RESELLER_MANAGER') {
    if (loading) {
      return (
        <div className="h-[60vh] w-full flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">Loading...</p>
          </div>
        </div>
      );
    }

    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, staggerChildren: 0.1 }}
        className="space-y-6 md:space-y-12"
      >
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center border border-white/10">
                <LayoutDashboard className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-semibold text-white tracking-tight">
                  Dashboard
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <p className="text-[12px] text-slate-500 font-medium tracking-wide">
                    {role === 'RESELLER_MANAGER' ? 'Reseller Manager' : 'Reseller'}: {resellerData?.name}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
             <div className="flex-1 md:flex-none bg-black border border-white/10 rounded-xl px-5 py-2.5 flex flex-col justify-center transition-all hover:border-white/20">
                <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest mb-1">Wallet Balance</div>
                <div className="text-base md:text-lg font-semibold text-white tracking-tight leading-none">
                  IDR {walletData?.balance.toLocaleString() || '0'}
                </div>
             </div>
             <button 
               onClick={() => setShowTopUp(true)}
               className="vortex-button-primary px-5 py-2.5 h-auto text-xs flex-shrink-0"
              >
               + Billing
             </button>
          </div>
        </motion.div>

        {/* Brand Identity & Quick Stats Bento */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6"
        >
          {/* White Label Card */}
          <div className="lg:col-span-8 relative overflow-hidden bg-slate-900/90 border border-white/15 rounded-2xl md:rounded-3xl p-6 md:p-10 hover:border-white/25 transition-all flex flex-col justify-between min-h-[320px]">
            <div className="absolute top-[-50%] right-[-10%] w-[80%] h-[150%] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 right-0 p-8 opacity-20 pointer-events-none hidden md:block">
               <Globe className="w-48 h-48 text-emerald-500 transform rotate-12" />
            </div>
            
            <div className="relative z-10 flex flex-col justify-between h-full space-y-8">
               <div className="flex items-center justify-between">
                 <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-semibold text-emerald-400">
                   <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                   Store Operational
                 </div>
                 <button className="text-slate-400 hover:text-white transition-colors">
                   <Settings className="w-5 h-5" />
                 </button>
               </div>
               
               <div className="pt-4">
                  <h3 className="text-3xl md:text-5xl font-bold text-white tracking-tight leading-tight mb-3">
                     {resellerData?.name || 'Partner Account'}
                  </h3>
                  <p className="text-sm md:text-base text-slate-355 max-w-lg leading-relaxed">
                     Control your white-label store, track live transactions, 
                     and monitor real-time fulfillment across robust backend nodes.
                  </p>
               </div>

               <div className="flex flex-wrap gap-3 pt-4">
                  <button 
                    onClick={() => window.open(`/market`, '_blank')}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black text-sm font-bold hover:bg-slate-200 transition-colors shadow-lg shadow-white/5 whitespace-nowrap"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open Command Center
                  </button>
                  <button 
                    onClick={() => setShowBranding(true)}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 border border-white/15 text-white text-sm font-bold hover:bg-white/20 hover:border-white/25 transition-all whitespace-nowrap animate-shine"
                  >
                    <Palette className="w-4 h-4" />
                    Customize Brand
                  </button>
               </div>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-6">
            <Card className="flex-1 p-6 bg-slate-900 border border-white/10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="flex justify-between items-start mb-6">
                <div className="p-2.5 bg-white/10 rounded-xl border border-white/15">
                  <Activity className="w-5 h-5 text-blue-400" />
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1.5">Total Orders</p>
                <div className="flex items-end gap-3">
                   <p className="text-4xl font-bold text-white tracking-tight leading-none">{recentOrders.length}</p>
                   <span className="text-xs text-blue-400 font-semibold mb-1">+12%</span>
                </div>
              </div>
            </Card>

            <Card className="flex-1 p-6 bg-slate-900 border border-emerald-500/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="flex justify-between items-start mb-6">
                <div className="p-2.5 bg-emerald-500/25 rounded-xl border border-emerald-500/30">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                </div>
              </div>
              <div>
                <p className="text-xs text-emerald-400/80 font-bold uppercase tracking-widest mb-1.5">Net Transactions</p>
                <div className="flex items-end gap-3">
                   <p className="text-4xl font-bold text-white tracking-tight leading-none">{recentTransactions.length}</p>
                   <span className="text-xs text-emerald-400 font-semibold mb-1">+24%</span>
                </div>
              </div>
            </Card>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          <div className="lg:col-span-2 space-y-6">
            <Card title="Account Security" subtitle="Your account is protected">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
                <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col items-center text-center hover:bg-white/[0.04] transition-colors">
                   <ShieldCheck className="w-6 h-6 text-emerald-500 mb-3" />
                   <span className="text-sm font-semibold text-white mb-1 tracking-tight">Data Protected</span>
                   <span className="text-[11px] text-slate-500 font-medium tracking-wide">Fully encrypted</span>
                </div>
                <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col items-center text-center hover:bg-white/[0.04] transition-colors">
                   <Activity className="w-6 h-6 text-white mb-3" />
                   <span className="text-sm font-semibold text-white mb-1 tracking-tight">Activity Monitored</span>
                   <span className="text-[11px] text-slate-500 font-medium tracking-wide">Secure tracking</span>
                </div>
                <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col items-center text-center hover:bg-white/[0.04] transition-colors">
                   <Cpu className="w-6 h-6 text-slate-400 mb-3" />
                   <span className="text-sm font-semibold text-white mb-1 tracking-tight">Session Safe</span>
                   <span className="text-[11px] text-slate-500 font-medium tracking-wide">Active protection</span>
                </div>
              </div>
            </Card>

            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                    <Package className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white tracking-tight">Product Catalog</h3>
                </div>
              </div>
              <Storefront resellerData={resellerData} />
            </div>
          </div>

          <div className="space-y-6">
            <Card title="Recent Activity" subtitle="Real-time transaction history">
              <div className="space-y-2 mt-2">
                {recentTransactions.map((tx) => (
                  <div key={tx.id} className="p-3 bg-[#0a0a0a] border border-white/5 rounded-xl flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 border border-white/10">
                         <History className="w-4 h-4 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-white tracking-tight leading-none mb-1">{tx.type}</p>
                        <p className="text-[10px] text-slate-500 uppercase font-semibold tracking-widest">{tx.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-white tracking-tight">IDR {tx.amount.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
                {recentTransactions.length === 0 && (
                  <p className="text-center py-6 text-sm text-slate-500 font-medium">No recent transactions recorded</p>
                )}
              </div>
              <button onClick={() => navigate('/history')} className="w-full mt-4 py-2 bg-transparent border border-white/5 rounded-lg text-xs font-semibold text-slate-400 hover:bg-white/5 hover:text-white transition-all">
                View Full History
              </button>
            </Card>
          </div>
        </motion.div>

        <AnimatePresence>
          {showTopUp && profile && (
            <TopUpForm 
              resellerId={profile.uid}
              agencyId={profile.agencyId!}
              onClose={() => setShowTopUp(false)} 
            />
          )}
          {showBranding && resellerData && profile && (
            <BrandingManager
              reseller={resellerData}
              onClose={() => setShowBranding(false)}
              onUpdate={handleBrandingUpdate}
            />
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  // Agency or Admin Layout
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, staggerChildren: 0.1 }}
      className="space-y-6 md:space-y-12"
    >
      {/* Welcome Header */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 md:gap-6"
      >
        <div>
          <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
            Dashboard
          </h2>
          <p className="text-[13px] text-slate-500 font-medium mt-1">
            Status: <span className="text-emerald-500">Online</span> &bull; Agency: {profile?.agencyId || 'Primary'}{role !== 'AGENCY' && role !== 'SUPER_ADMIN' && ` • Role: ${role?.replace('_', ' ')}`}
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            className="flex items-center gap-2 px-5 py-2 z-10 bg-white/5 border border-white/10 rounded-xl text-xs font-semibold text-white transition-all hover:bg-white/10 hover:border-white/20"
          >
            <Download className="w-4 h-4" />
            Export Data
          </button>
          <div className="flex items-center gap-2.5 px-4 py-2 bg-emerald-500/[0.03] border border-emerald-500/10 rounded-xl">
             <ShieldCheck className="w-4 h-4 text-emerald-500" />
             <div className="flex flex-col justify-center">
               <p className="text-[10px] font-bold text-emerald-500/70 uppercase tracking-widest leading-none">Security</p>
               <p className="text-xs text-white font-medium mt-0.5 leading-none">Verified</p>
             </div>
          </div>
        </div>
      </motion.div>

      <OnboardingWidget />

      {/* Main Grid */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8"
      >
        
        {/* Full-width analytics chart */}
        <div className="lg:col-span-3">
           <Card className="p-0 overflow-hidden">
              <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5">
                 <div>
                    <h3 className="text-lg md:text-xl font-semibold text-white tracking-tight">Revenue & Transaction Volume</h3>
                    <p className="text-[13px] text-slate-500 font-medium mt-1">Aggregate transaction data across your platform.</p>
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="text-right">
                       <p className="text-[11px] text-slate-500 uppercase font-semibold tracking-widest mb-1.5">Today's Volume</p>
                       <p className="text-3xl font-semibold text-white tracking-tight">IDR 4.2B</p>
                    </div>
                 </div>
              </div>
              <div className="h-[320px] w-full p-6 pb-0">
                 <RevenueChart />
              </div>
           </Card>
        </div>

        {/* Live Feed */}
        <div className="lg:col-span-2 space-y-6">
          <Card 
            title="Recent Transactions" 
            subtitle="Recent orders across your network"
            className="h-full border-white/5 bg-white/[0.01]"
          >
            <div className="space-y-3 mt-2">
              {recentOrders.map((order, i) => (
                <div 
                  key={order.id} 
                  className={cn(
                    "flex items-center justify-between p-4 rounded-2xl border border-white/5 bg-black/20 hover:bg-white/[0.02] transition-colors duration-300",
                    i === 0 && "ring-1 ring-white/10"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center border",
                      order.status === 'COMPLETED' ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-500" :
                      order.status === 'PENDING' || order.status === 'PROCESSING' ? "bg-amber-500/5 border-amber-500/20 text-amber-500 animate-pulse" :
                      "bg-red-500/5 border-red-500/20 text-red-500"
                    )}>
                      {order.status === 'COMPLETED' ? <CheckCircle2 className="w-5 h-5" /> : 
                       <RefreshCcw className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="text-[14px] font-semibold text-white tracking-tight">{order.productId}</p>
                      <p className="text-xs text-slate-500 font-medium mt-1">
                        Partner: <span className="text-slate-400">{order.resellerId.slice(0, 8)}</span> &bull; Ref: {order.id.slice(0, 8)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[15px] font-medium text-white tracking-tight">
                      IDR {order.totalCost.toLocaleString()}
                    </p>
                    <p className={cn(
                      "text-[10px] uppercase font-bold tracking-widest mt-1.5",
                      order.status === 'COMPLETED' ? "text-emerald-500" :
                      order.status === 'PENDING' || order.status === 'PROCESSING' ? "text-amber-500" : "text-red-500"
                    )}>
                      {order.status}
                    </p>
                  </div>
                </div>
              ))}
              {recentOrders.length === 0 && (
                <p className="text-center py-12 text-sm text-slate-500 font-medium">Awaiting recent orders...</p>
              )}
            </div>
          </Card>
        </div>

        {/* Side Controls */}
        <div className="space-y-6">
          <BalanceAlerts />
          <Card title="Quick Navigation" subtitle="Dedicated access points">
            <div className="grid grid-cols-2 gap-3 mt-4">
              {[
                { label: 'Market', icon: Package, path: '/catalog' },
                { label: 'Partners', icon: Users, path: '/resellers' },
                { label: 'Providers', icon: Cpu, path: '/suppliers' },
                { label: 'Security', icon: ShieldCheck, path: '/security' }
              ].map((link) => (
                <button 
                  key={link.label}
                  onClick={() => navigate(link.path)}
                  className="flex flex-col items-center justify-center gap-3 p-5 rounded-2xl bg-[#0a0a0a] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300 group"
                >
                  <link.icon className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
                  <span className="text-xs font-semibold text-slate-500 group-hover:text-white transition-colors">
                    {link.label}
                  </span>
                </button>
              ))}
            </div>
          </Card>

          <Card title="Recent Activity" subtitle="Your recent actions">
             <div className="space-y-4 mt-2">
                {[
                  { time: '14:22:04', event: 'Password Updated', user: 'You', status: 'Success' },
                  { time: '13:10:45', event: 'Logged In', user: 'You', status: 'Success' },
                  { time: '11:05:12', event: 'Profile Updated', user: 'You', status: 'Success' }
                ].map((log, i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0 hover:bg-white/[0.02] -mx-4 px-4 transition-colors rounded-lg">
                    <div className="flex items-start gap-4">
                       <span className="text-[11px] text-slate-500 mt-0.5">{log.time}</span>
                       <div>
                          <p className="text-xs font-semibold text-slate-200 tracking-wide">{log.event}</p>
                       </div>
                    </div>
                    <span className="text-[11px] font-medium text-slate-400 bg-white/5 px-2 py-1 rounded border border-white/10">{log.status}</span>
                  </div>
                ))}
             </div>
          </Card>
        </div>
      </motion.div>
    </motion.div>
  );
};
