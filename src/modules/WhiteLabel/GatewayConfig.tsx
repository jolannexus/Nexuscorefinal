import React, { useState } from 'react';
import { ShieldCheck, Database, Zap } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { cn } from '../../utils/cn';

export const GatewayConfig = () => {
  const [accountId, setAccountId] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    if (!accountId || !secretKey) return;
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <Card className="border-blue-900/40 bg-blue-950/10" glow>
      <SectionHeader title="05. AGENCY GATEWAY CONFIG" icon={Zap} colorClass="text-blue-400" />
      <div className="space-y-4">
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">Account ID</label>
            <input 
              type="text" 
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              placeholder="AG-XXXX-XXXX"
              className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-white font-mono outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">Secret Vault Key</label>
            <div className="relative">
              <input 
                type="password" 
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                placeholder="••••••••••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-white font-mono outline-none focus:border-blue-500 transition-colors pr-10"
              />
              <ShieldCheck className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700" />
            </div>
          </div>
        </div>

        <button 
          onClick={handleSave}
          disabled={!accountId || !secretKey}
          className={cn(
            "w-full py-2.5 rounded text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2",
            isSaved 
              ? "bg-emerald-600 text-white" 
              : (accountId && secretKey)
                ? "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] active:scale-95" 
                : "bg-slate-800 text-slate-500 cursor-not-allowed"
          )}
        >
          {isSaved ? (
            <>
              <Zap className="w-3 h-3 fill-current" />
              Vault Synchronized
            </>
          ) : (
            <>
              <Database className="w-3 h-3" />
              Save Credentials
            </>
          )}
        </button>
        {isSaved && (
          <p className="text-xs text-emerald-500 font-mono text-center animate-pulse uppercase tracking-tight">
            Encryption Protocol: AES-256-GCM Active
          </p>
        )}
      </div>
    </Card>
  );
};
