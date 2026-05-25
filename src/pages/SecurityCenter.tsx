import React from 'react';
import { Card } from '../components/ui/Card';
import { 
  ShieldCheck, 
  Lock, 
  Eye, 
  Globe, 
  Smartphone, 
  Key, 
  AlertTriangle,
  History,
  CheckCircle2,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { cn } from '../utils/cn';

const SECURITY_LOGS = [
  { id: 1, action: 'Login Success', ip: '182.1.44.12', device: 'Chrome on MacOS', time: '2m ago', level: 'info' },
  { id: 2, action: 'API Key Generated', ip: '182.1.44.12', device: 'Chrome on MacOS', time: '1h ago', level: 'warn' },
  { id: 3, action: 'Settings Modified', ip: '182.1.44.12', device: 'Chrome on MacOS', time: '5h ago', level: 'info' },
  { id: 4, action: 'Login Attempt Denied', ip: '45.12.99.1', device: 'Unknown Browser on Linux', time: '1d ago', level: 'error' },
];

export const SecurityCenter = () => {
  return (
    <div className="space-y-8 max-w-7xl mx-auto py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-white shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h1 className="text-3xl font-semibold text-white tracking-tight leading-none">
              Security Center
            </h1>
          </div>
          <p className="text-[13px] text-slate-500 font-medium tracking-wide flex items-center gap-2 mt-1">
            Manage your account security
          </p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-[11px] font-semibold text-emerald-500 uppercase tracking-widest">Account Secured</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Status Hub */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card title="Multi-Factor Auth" subtitle="Two-Factor Authentication">
              <div className="mt-4">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white tracking-tight">Active Session</h4>
                      <p className="text-[11px] text-slate-500 font-medium tracking-wide">Authenticator App Linked</p>
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Verified</span>
                  </div>
                </div>
                <button className="w-full py-2.5 bg-transparent border border-white/10 rounded-xl text-xs font-semibold text-white tracking-wide hover:bg-white/5 hover:border-white/20 transition-all">
                  Configure Settings
                </button>
              </div>
            </Card>

            <Card title="API Access" subtitle="Manage API security settings">
              <div className="mt-4">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                      <Key className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white tracking-tight">IP Whitelisting</h4>
                      <p className="text-[11px] text-slate-500 font-medium tracking-wide">2 IP Addresses Authorized</p>
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-md">
                    <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Selective</span>
                  </div>
                </div>
                <button className="w-full py-2.5 bg-transparent border border-white/10 rounded-xl text-xs font-semibold text-white tracking-wide hover:bg-white/5 hover:border-white/20 transition-all">
                  Manage Whitelists
                </button>
              </div>
            </Card>
          </div>

          {/* Audit Logs */}
          <Card 
            title="Recent Activity" 
            subtitle="Recent security events"
          >
            <div className="space-y-3 mt-4">
              {SECURITY_LOGS.map((log) => (
                <div key={log.id} className="group p-4 bg-black border border-white/5 rounded-2xl flex items-center justify-between hover:border-white/10 transition-colors">
                   <div className="flex items-center gap-4">
                     <div className={cn(
                       "w-9 h-9 rounded-xl flex items-center justify-center transition-colors border",
                       log.level === 'error' ? "bg-red-500/10 border-red-500/20 text-red-500" :
                       log.level === 'warn' ? "bg-amber-500/10 border-amber-500/20 text-amber-500" : "bg-white/5 border-white/10 text-slate-400"
                     )}>
                       {log.level === 'error' ? <ShieldAlert className="w-4 h-4" /> : <History className="w-4 h-4" />}
                     </div>
                     <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-[12px] font-semibold text-white tracking-wide">{log.action}</p>
                          {log.level === 'error' && <span className="text-[9px] font-bold bg-red-500/20 border border-red-500/30 text-red-500 px-1.5 py-0.5 rounded uppercase tracking-wider">FAILED</span>}
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium tracking-wider">{log.ip} <span className="text-slate-700 mx-1">•</span> {log.device}</p>
                     </div>
                   </div>
                   <div className="text-right flex flex-col justify-between h-full">
                     <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest leading-none mb-2">{log.time}</p>
                   </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 py-3 bg-white/[0.02] border border-white/5 rounded-xl text-[11px] font-semibold text-slate-400 hover:text-white uppercase tracking-widest transition-all hover:bg-white/5">
              Download Logs
            </button>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Security Score" subtitle="Account Health">
            <div className="py-2 flex flex-col items-center mt-4">
              <div className="relative w-40 h-40 mb-8">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="12"
                    className="text-white/5"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="12"
                    strokeDasharray="440"
                    strokeDashoffset="44"
                    className="text-emerald-500"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
                  <span className="text-4xl font-semibold text-white tracking-tight">90%</span>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Safe Score</span>
                </div>
              </div>
              
              <div className="w-full space-y-2">
                 <div className="flex justify-between items-center px-4 py-3 bg-white/[0.02] border border-white/5 rounded-xl">
                   <div className="flex items-center gap-3">
                     <ShieldCheck className="w-4 h-4 text-emerald-400" />
                     <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wide">Active Firewall</span>
                   </div>
                   <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                 </div>
                 <div className="flex justify-between items-center px-4 py-3 bg-white/[0.02] border border-white/5 rounded-xl">
                   <div className="flex items-center gap-3">
                     <Lock className="w-4 h-4 text-indigo-400" />
                     <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wide">Zero-Trust Auth</span>
                   </div>
                   <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                 </div>
                 <div className="flex justify-between items-center px-4 py-3 bg-white/[0.02] border border-white/5 rounded-xl">
                   <div className="flex items-center gap-3">
                     <Eye className="w-4 h-4 text-amber-500" />
                     <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wide">Intrusion Detect</span>
                   </div>
                   <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse mr-1" />
                 </div>
              </div>
            </div>
          </Card>

          <Card title="Encryption Protocols" subtitle="End-to-End Security Standards">
            <div className="space-y-5 mt-4">
               <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[11px] font-semibold text-white uppercase tracking-widest">AES-256 GCM</span>
                    <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded">ENABLED</span>
                  </div>
                  <div className="h-1.5 bg-black border border-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-full" />
                  </div>
               </div>
               <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[11px] font-semibold text-white uppercase tracking-widest">TLS 1.3 Strict</span>
                    <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest bg-indigo-500/10 px-2 py-0.5 rounded">REQUIRED</span>
                  </div>
                  <div className="h-1.5 bg-black border border-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 w-full" />
                  </div>
               </div>
               <p className="text-[11px] text-slate-500 font-medium tracking-wide pt-4 border-t border-white/5">
                 All data connections are cryptographically signed and verified.
               </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
