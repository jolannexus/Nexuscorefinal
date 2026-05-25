import React, { useState } from 'react';
import { 
  Cpu, 
  Key, 
  Webhook, 
  Copy, 
  RefreshCw, 
  Check, 
  Eye, 
  EyeOff,
  Zap,
  Globe,
  Plus,
  Play,
  Settings2,
  Trash2,
  Code,
  Activity
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { cn } from '../utils/cn';

const DevSettings = () => {
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);

  const apiKey = "nx_live_2026_A5k9x7v2m4q8z3w1p0x2j4l9m";

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const webhooks = [
    { id: '1', url: 'https://api.company.com/v1/webhook', events: ['order.failed', 'order.completed'], status: 'Active' },
    { id: '2', url: 'https://hooks.slack.com/services/T000/B000', events: ['system.alert'], status: 'Inactive' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-8">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-white shadow-sm">
            <Cpu className="w-5 h-5" />
          </div>
          <h1 className="text-3xl font-semibold text-white tracking-tight leading-none">
            Developer Settings
          </h1>
        </div>
        <p className="text-[13px] text-slate-500 font-medium max-w-lg mt-1">
          Integrate our infrastructure into your internal systems using our high-performance API and real-time webhook system.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* API Keys Card */}
          <Card 
            title="Live API Authentication" 
            subtitle="Production keys used for authenticating server-side requests"
          >
            <div className="space-y-6 mt-4">
               <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Key className="w-4 h-4 text-emerald-500" />
                      <span className="text-[11px] font-semibold text-white uppercase tracking-widest">Default Production Key</span>
                    </div>
                    <div className="flex items-center gap-3">
                       <span className="text-[11px] font-medium text-slate-500">Created May 12, 2026</span>
                       <div className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-500 uppercase">Active</div>
                    </div>
                  </div>

                  <div className="relative group">
                    <input 
                      type={showKey ? "text" : "password"} 
                      readOnly
                      value={apiKey}
                      className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-[13px] font-mono text-slate-300 outline-none focus:border-white/30"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      <button 
                        onClick={() => setShowKey(!showKey)}
                        className="p-1.5 text-slate-500 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                      >
                        {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button 
                        onClick={handleCopy}
                        className="p-1.5 text-slate-500 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                      >
                        {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-3">
                     <button className="flex items-center gap-2 px-4 py-2 bg-transparent hover:bg-white/5 border border-white/10 rounded-lg text-[11px] font-semibold text-slate-400 uppercase tracking-widest transition-all">
                        <RefreshCw className="w-3.5 h-3.5" />
                        Roll Secret Key
                     </button>
                     <button className="flex items-center gap-2 px-4 py-2 bg-transparent hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 border border-white/10 rounded-lg text-[11px] font-semibold text-slate-400 uppercase tracking-widest transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                     </button>
                  </div>
               </div>

               <div className="p-4 bg-indigo-500/[0.02] border border-indigo-500/10 rounded-xl flex items-start gap-4">
                  <div className="p-2 bg-indigo-500/10 rounded-lg">
                    <Globe className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div>
                    <h5 className="text-[12px] font-semibold text-white mb-0.5 tracking-wide">API Endpoint Protocol</h5>
                    <p className="text-[11px] text-slate-500 font-medium">Global production endpoint: <code className="text-slate-300 font-mono font-semibold ml-1 bg-white/5 px-1.5 py-0.5 rounded">https://api.nexuscore.io/v1</code></p>
                  </div>
               </div>
            </div>
          </Card>

          {/* Webhooks Card */}
          <Card 
            title="Real-time Webhooks" 
            subtitle="Send notifications to your services when events occur"
          >
            <div className="space-y-3 mt-4">
              {webhooks.map((hook) => (
                <div key={hook.id} className="p-4 bg-[#0a0a0a] border border-white/5 rounded-2xl group hover:border-white/10 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center border",
                        hook.status === 'Active' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-white/5 border-white/10 text-slate-500"
                      )}>
                        <Webhook className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-white tracking-tight">{hook.url}</span>
                        <div className="flex flex-wrap gap-2 mt-1.5">
                          {hook.events.map(event => (
                            <span key={event} className="text-[10px] font-semibold text-slate-400 bg-white/5 px-2 py-0.5 rounded-md border border-white/10">{event}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                       <button className="p-2 text-slate-500 hover:text-white transition-all rounded-lg hover:bg-white/5">
                          <Settings2 className="w-4 h-4" />
                       </button>
                    </div>
                  </div>
                </div>
              ))}
              
              <button className="w-full py-3.5 border border-dashed border-white/10 rounded-2xl text-[11px] font-semibold text-slate-500 uppercase tracking-widest hover:border-white/30 hover:text-white hover:bg-white/[0.02] transition-all flex items-center justify-center gap-2 mt-2">
                <Plus className="w-4 h-4" />
                Add Webhook Endpoint
              </button>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Documentation Card */}
          <Card title="Quick Integration" subtitle="SDK and Documentation">
            <div className="space-y-2 mt-4">
               {[
                 { label: 'REST API Docs', icon: Globe, path: '#' },
                 { label: 'Node.js SDK', icon: Code, path: '#' },
                 { label: 'Python SDK', icon: Code, path: '#' },
                 { label: 'Postman Collection', icon: Zap, path: '#' }
               ].map((doc, i) => (
                 <a 
                   key={i}
                   href={doc.path}
                   className="flex items-center justify-between p-3.5 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/[0.05] hover:border-white/10 transition-all group"
                 >
                   <div className="flex items-center gap-3">
                     <doc.icon className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                     <span className="text-xs font-medium text-slate-300">{doc.label}</span>
                   </div>
                   <ArrowRightIcon className="w-3 h-3 text-slate-500 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
                 </a>
               ))}
            </div>
          </Card>

          {/* Usage Limits */}
          <Card title="Usage & Rate Limits" subtitle="Monthly infrastructure allocation">
             <div className="space-y-5 mt-4">
                <div className="space-y-2">
                   <div className="flex justify-between text-[11px] font-semibold tracking-widest uppercase">
                      <span className="text-slate-500">API Requests</span>
                      <span className="text-white">422 / 100k</span>
                   </div>
                   <div className="h-1.5 w-full bg-black rounded-full overflow-hidden border border-white/5">
                      <div className="h-full w-[4%] bg-emerald-500" />
                   </div>
                </div>
                <div className="space-y-2">
                   <div className="flex justify-between text-[11px] font-semibold tracking-widest uppercase">
                      <span className="text-slate-500">Webhook Workers</span>
                      <span className="text-white">2 / 10</span>
                   </div>
                   <div className="h-1.5 w-full bg-black rounded-full overflow-hidden border border-white/5">
                      <div className="h-full w-[20%] bg-indigo-500" />
                   </div>
                </div>
                <div className="pt-5 border-t border-white/5">
                   <div className="flex items-start gap-3 p-3 bg-white/[0.02] rounded-xl border border-white/5">
                     <Activity className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                     <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                        Enterprise Tier active. Priority queuing and 1M requests per second enabled.
                     </p>
                   </div>
                </div>
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Helper icon component for inline usage
const ArrowRightIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

export default DevSettings;
