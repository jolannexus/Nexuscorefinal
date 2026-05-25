import React from 'react';
import { Card } from '../components/ui/Card';
import { TicketSystem } from '../modules/Support/TicketSystem';
import { cn } from '../utils/cn';
import { 
  LifeBuoy, 
  ShieldCheck, 
  Cpu, 
  Globe
} from 'lucide-react';

export const SupportPage = () => {
  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold text-white uppercase tracking-wider">Help & Support</h1>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-3 flex items-center gap-2">
            <LifeBuoy className="w-3 h-3 text-purple-500" />
            24/7 Customer Assistance
          </p>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-3xl backdrop-blur-xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-bold uppercase">System Status</div>
              <div className="text-xs font-bold text-white uppercase">Operational</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <TicketSystem />
        </div>
        
        <div className="space-y-6">
          <Card title="System Status" subtitle="Global Connectivity status">
            <div className="relative aspect-square bg-[#030712] rounded-2xl overflow-hidden border border-slate-800 p-4 flex items-center justify-center">
               <div className="absolute inset-0 opacity-20">
                 <div className="w-full h-full bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.2)_0%,transparent_70%)]" />
                 <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-40 mix-blend-overlay" />
               </div>
               
               <div className="relative w-full h-full">
                  {/* System Connections */}
                  {[
                    { t: '10%', l: '20%', s: 'active' },
                    { t: '40%', l: '70%', s: 'active' },
                    { t: '80%', l: '30%', s: 'active' },
                    { t: '60%', l: '10%', s: 'warn' },
                    { t: '20%', l: '80%', s: 'active' },
                  ].map((node, i) => (
                    <div 
                      key={i}
                      className={cn(
                        "absolute w-1.5 h-1.5 rounded-full",
                        node.s === 'active' ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" : "bg-amber-500 animate-pulse"
                      )}
                      style={{ top: node.t, left: node.l }}
                    />
                  ))}
                  <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none">
                    <line x1="20%" y1="10%" x2="70%" y2="40%" stroke="currentColor" className="text-emerald-500" strokeWidth="0.5" />
                    <line x1="70%" y1="40%" x2="30%" y2="80%" stroke="currentColor" className="text-emerald-500" strokeWidth="0.5" />
                    <line x1="30%" y1="80%" x2="10%" y2="60%" stroke="currentColor" className="text-amber-500" strokeWidth="0.5" strokeDasharray="4 2" />
                    <line x1="10%" y1="60%" x2="20%" y2="10%" stroke="currentColor" className="text-emerald-500" strokeWidth="0.5" />
                  </svg>
               </div>
            </div>
            <div className="mt-4 space-y-2">
               <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider">
                  <span className="text-slate-500">Systems Online</span>
                  <span className="text-emerald-500">42/42</span>
               </div>
               <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider">
                  <span className="text-slate-500">Link Stability</span>
                  <span className="text-primary">Optimal</span>
               </div>
            </div>
          </Card>

          <Card title="Traffic Load" accent>
            <div className="space-y-4">
              <div className="h-20 flex items-end gap-1 px-1">
                {[40, 70, 45, 90, 65, 80, 55, 75, 60, 85].map((h, i) => (
                  <div 
                    key={i} 
                    className="flex-1 bg-primary/20 rounded-t-sm relative group"
                    style={{ height: `${h}%` }}
                  >
                    <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-500 uppercase font-bold text-center tracking-wider">Traffic Load (Last 6h)</p>
            </div>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 border-t border-slate-800">
        <div className="space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
            <Cpu className="w-6 h-6 text-blue-500" />
          </div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Self Service Docs</h3>
          <p className="text-xs text-slate-500 leading-relaxed font-mono">
            Access our technical documentation to resolve common integration issues.
          </p>
          <button className="text-xs text-blue-500 font-bold uppercase tracking-wider hover:text-blue-400 transition-colors">
            Browse Library {'->'}
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
            <Globe className="w-6 h-6 text-purple-500" />
          </div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Global Status</h3>
          <p className="text-xs text-slate-500 leading-relaxed font-mono">
            Real-time monitoring of all infrastructure services and supplier connectivity status.
          </p>
          <button className="text-xs text-purple-500 font-bold uppercase tracking-wider hover:text-purple-400 transition-colors">
            View System Status {'->'}
          </button>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 rounded-[40px] p-8 flex flex-col justify-center items-center text-center space-y-4">
          <div className="text-xs text-slate-600 font-bold uppercase tracking-wider">Direct Contact</div>
          <div className="text-xl font-bold text-white font-mono">TG: @GStars Support</div>
          <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Available for high-priority support</p>
        </div>
      </div>
    </div>
  );
};
