import React, { useState } from 'react';
import { Globe, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { Card } from '../../components/ui/Card';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { cn } from '../../utils/cn';
import { apiService } from '../../services/api.service';

export const DomainManager = () => {
  const [domain, setDomain] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [status, setStatus] = useState<'IDLE' | 'PENDING' | 'VERIFIED' | 'LIVE'>('IDLE');

  const handleVerify = async () => {
    setIsVerifying(true);
    try {
      // In a real app we'd call apiService.verifyDomain(domain);
      // For this demo let's assume it works
      await new Promise(r => setTimeout(r, 1500));
      setStatus('PENDING');
    } catch (e) {
      console.error(e);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleProvision = async () => {
    setIsProvisioning(true);
    try {
      await new Promise(r => setTimeout(r, 2000));
      setStatus('VERIFIED');
      setTimeout(() => setStatus('LIVE'), 5000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsProvisioning(false);
    }
  };

  return (
    <Card className="border-blue-900/40 bg-blue-950/5">
      <SectionHeader title="34. Domain Provisioning" icon={Globe} colorClass="text-blue-400" />
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">Storefront Domain</label>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="store.yourbrand.com"
              className="flex-1 bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-xs text-white font-mono outline-none focus:border-blue-500"
              disabled={status === 'LIVE' || isProvisioning}
            />
            {status === 'IDLE' || status === 'PENDING' ? (
              <button 
                onClick={handleVerify}
                disabled={!domain || isVerifying}
                className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded uppercase hover:bg-blue-500 disabled:opacity-50"
              >
                {isVerifying ? 'Scanning...' : 'Verify DNS'}
              </button>
            ) : status === 'VERIFIED' ? (
              <div className="px-3 py-1.5 bg-emerald-600/20 text-emerald-400 text-xs font-bold rounded uppercase border border-emerald-500/30">
                Provisioning...
              </div>
            ) : status === 'LIVE' ? (
              <div className="px-3 py-1.5 bg-blue-600/20 text-blue-400 text-xs font-bold rounded uppercase border border-blue-500/30">
                ACTIVE
              </div>
            ) : null}
          </div>
        </div>

        {status === 'PENDING' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-3"
          >
             <button 
                onClick={handleProvision}
                disabled={isProvisioning}
                className="w-full py-2 bg-emerald-600 text-white text-xs font-bold rounded uppercase hover:bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
              >
                {isProvisioning ? 'Starting Pipeline...' : 'Finish Setup & Issue SSL'}
              </button>
          </motion.div>
        )}

        {status !== 'IDLE' && status !== 'LIVE' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-slate-950 rounded border border-slate-800 space-y-3"
          >
            <div className="flex justify-between items-center">
               <span className="text-xs text-slate-500 font-bold uppercase">Required DNS Records</span>
               <span className={cn(
                 "text-xs font-bold px-1.5 py-0.5 rounded",
                 status === 'PENDING' ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-400"
               )}>{status}</span>
            </div>
            
            <div className="space-y-1.5">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-slate-600 font-mono italic">CNAME Record (Subdomain)</span>
                <div className="flex justify-between items-center font-medium text-xs bg-black/40 p-1.5 rounded border border-slate-800">
                   <span className="text-slate-400">Host: @ / shop</span>
                   <ArrowUpRight className="w-2 h-2 text-slate-700" />
                   <span className="text-blue-400">cname.nexus.io</span>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-slate-600 font-mono italic">A Record (Root Apex)</span>
                <div className="flex justify-between items-center font-medium text-xs bg-black/40 p-1.5 rounded border border-slate-800">
                   <span className="text-slate-400">IP: 76.76.21.21</span>
                   <ShieldCheck className="w-2 h-2 text-emerald-500/50" />
                   <span className="text-slate-300">Auto-Detect</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-500 italic leading-tight">
              Propagation may take up to 24 hours. SSL certificates will be provisioned automatically once verification completes.
            </p>
          </motion.div>
        )}

        {status === 'LIVE' && (
          <div className="p-4 bg-blue-600/10 border border-blue-500/20 rounded text-center space-y-2">
             <div className="flex justify-center"><Globe className="w-6 h-6 text-blue-400 animate-pulse" /></div>
             <p className="text-xs font-bold text-white uppercase">{domain}</p>
             <p className="text-xs text-blue-400 font-medium uppercase tracking-tight">Instance routing successfully updated</p>
          </div>
        )}
      </div>
    </Card>
  );
};
