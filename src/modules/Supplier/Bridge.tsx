import React, { useState } from 'react';
import { Zap } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { cn } from '../../utils/cn';

export const Bridge = () => {
  const [activeSupplier, setActiveSupplier] = useState<'digiflazz' | 'unipin'>('digiflazz');
  const [keys, setKeys] = useState({
    digiflazz: { user: '', key: '' },
    unipin: { user: '', key: '' }
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 2000);
  };

  return (
    <Card className="border-purple-900/30 bg-purple-950/5">
      <SectionHeader title="09. MULTI-SUPPLIER BRIDGE" icon={Zap} colorClass="text-purple-400" />
      <div className="flex gap-1 mb-4 p-1 bg-slate-950 rounded border border-slate-800">
        <button 
          onClick={() => setActiveSupplier('digiflazz')}
          className={cn(
            "flex-1 py-1 text-xs font-bold uppercase tracking-tight rounded transition-all",
            activeSupplier === 'digiflazz' ? "bg-purple-600 text-white" : "text-slate-500 hover:text-slate-300"
          )}
        >
          Digiflazz
        </button>
        <button 
          onClick={() => setActiveSupplier('unipin')}
          className={cn(
            "flex-1 py-1 text-xs font-bold uppercase tracking-tight rounded transition-all",
            activeSupplier === 'unipin' ? "bg-blue-600 text-white" : "text-slate-500 hover:text-slate-300"
          )}
        >
          Unipin
        </button>
      </div>

      <div className="space-y-3">
        <div className="space-y-1.5">
          <label className="text-xs text-slate-500 font-bold uppercase">API Username / ID</label>
          <input 
            type="text" 
            value={keys[activeSupplier].user}
            onChange={(e) => setKeys({...keys, [activeSupplier]: {...keys[activeSupplier], user: e.target.value}})}
            className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-xs text-white font-mono outline-none focus:border-purple-500"
            placeholder={activeSupplier === 'digiflazz' ? "digiflazz_user" : "unipin_merchant_id"}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-slate-500 font-bold uppercase">Production API Key</label>
          <input 
            type="password" 
            value={keys[activeSupplier].key}
            onChange={(e) => setKeys({...keys, [activeSupplier]: {...keys[activeSupplier], key: e.target.value}})}
            className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-xs text-white font-mono outline-none focus:border-purple-500"
            placeholder="••••••••••••••••"
          />
        </div>
        <button 
          onClick={handleSave}
          className={cn(
            "w-full py-2 rounded text-xs font-bold uppercase tracking-wider transition-all",
            isSaving ? "bg-emerald-600 text-white" : "bg-purple-600/20 text-purple-400 border border-purple-500/30 hover:bg-purple-500/10"
          )}
        >
          {isSaving ? "Bridge Synced" : "Connect Provider"}
        </button>
      </div>
    </Card>
  );
};
