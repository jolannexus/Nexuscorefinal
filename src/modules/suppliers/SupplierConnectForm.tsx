import React, { useState } from 'react';
import { 
  X, 
  Shield, 
  Key, 
  Hash, 
  Activity, 
  CheckCircle2, 
  AlertCircle,
  Zap
} from 'lucide-react';
import { motion } from 'motion/react';
import { useSuppliers } from '../../hooks/useSuppliers';
import { supplierRegistry } from '../../adapters/suppliers/registry';
import { cn } from '../../utils/cn';
import { SupplierConnection } from '../../types';

interface SupplierConnectFormProps {
  onClose: () => void;
  initialData?: SupplierConnection | null;
  supplierId?: string;
}

export const SupplierConnectForm: React.FC<SupplierConnectFormProps> = ({ onClose, initialData, supplierId }) => {
  const { addConnection, updateConnection } = useSuppliers();
  const [selectedSupplierId, setSelectedSupplierId] = useState(initialData?.supplierName?.toLowerCase() || supplierId || supplierRegistry.getAllAdapters()[0].id);
  const [apiKey, setApiKey] = useState(initialData?.apiKey || '');
  const [secretKey, setSecretKey] = useState(initialData?.secretKey || '');
  const [resellerId, setResellerId] = useState(initialData?.resellerId || '');
  const [username, setUsername] = useState((initialData as any)?.username || '');
  const [webhookSecret, setWebhookSecret] = useState((initialData as any)?.webhookSecret || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        apiKey,
        secretKey,
        resellerId,
        username,
        webhookSecret,
        supplierName: supplierRegistry.getAdapter(selectedSupplierId)?.name || (initialData?.supplierName)
      };

      if (initialData) {
        await updateConnection(initialData.id, payload);
      } else {
        await addConnection(payload);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to establish connection');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" 
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-500" />
              {initialData ? 'Update Configuration' : 'Configure Connection'}
            </h3>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">
              {initialData ? 'Updating provider settings...' : 'Connecting to provider...'}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white p-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-400 font-mono flex items-center gap-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-4">
            {!initialData && (
              <div className="space-y-1.5">
                <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">Select Provider</label>
                <div className="grid grid-cols-2 gap-2">
                  {supplierRegistry.getAllAdapters().map((adapter) => (
                    <button
                      key={adapter.id}
                      type="button"
                      onClick={() => setSelectedSupplierId(adapter.id)}
                      className={cn(
                        "p-3 rounded-xl border text-left transition-all",
                        selectedSupplierId === adapter.id
                          ? "bg-blue-600/10 border-blue-500 text-white"
                          : "bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-800"
                      )}
                    >
                      <span className="text-xs font-bold uppercase block">{adapter.name}</span>
                      <span className="text-xs font-medium opacity-50">NODE_ID: {adapter.id}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">API Username</label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-3 text-xs text-white outline-none focus:border-blue-500 transition-all font-mono"
                    placeholder="vortex_user"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">Identity Hash (RESELLER_ID)</label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    value={resellerId}
                    onChange={(e) => setResellerId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-3 text-xs text-white outline-none focus:border-blue-500 transition-all font-mono"
                    placeholder="RS_99402"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 focus-within:relative z-10">
                <div className="flex justify-between items-center">
                  <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">API Key</label>
                  {apiKey.length > 0 && (
                    <span className={cn(
                      "text-xs font-bold uppercase tracking-wider",
                      apiKey.length >= 16 ? "text-emerald-500" : "text-amber-500"
                    )}>
                      {apiKey.length >= 16 ? 'Valid Length' : 'Too Short'}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Key className={cn(
                    "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors",
                    apiKey.length >= 16 ? "text-emerald-500" : "text-slate-500"
                  )} />
                  <input 
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className={cn(
                      "w-full bg-slate-950 border rounded-lg pl-10 pr-4 py-3 text-xs text-white outline-none transition-all font-mono",
                      apiKey.length > 0
                        ? (apiKey.length >= 16 ? 'border-emerald-500/50 focus:border-emerald-500' : 'border-amber-500/50 focus:border-amber-500')
                        : 'border-slate-800 focus:border-primary'
                    )}
                    placeholder="nexus_api_778..."
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5 focus-within:relative z-10">
                <div className="flex justify-between items-center">
                  <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">Secret Key</label>
                  {secretKey.length > 0 && (
                    <span className={cn(
                      "text-xs font-bold uppercase tracking-wider",
                      secretKey.length >= 16 ? "text-emerald-500" : "text-amber-500"
                    )}>
                      {secretKey.length >= 16 ? 'Valid Length' : 'Too Short'}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Shield className={cn(
                    "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors",
                    secretKey.length >= 16 ? "text-emerald-500" : "text-slate-500"
                  )} />
                  <input 
                    type="password"
                    value={secretKey}
                    onChange={(e) => setSecretKey(e.target.value)}
                    className={cn(
                      "w-full bg-slate-950 border rounded-lg pl-10 pr-4 py-3 text-xs text-white outline-none transition-all font-mono",
                      secretKey.length > 0
                        ? (secretKey.length >= 16 ? 'border-emerald-500/50 focus:border-emerald-500' : 'border-amber-500/50 focus:border-amber-500')
                        : 'border-slate-800 focus:border-primary'
                    )}
                    placeholder="SK-XXXX-XXXX"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">Webhook Signing Secret</label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  type="password"
                  value={webhookSecret}
                  onChange={(e) => setWebhookSecret(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-3 text-xs text-white outline-none focus:border-blue-500 transition-all font-mono"
                  placeholder="WH-SECRET-..."
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-500">
              <CheckCircle2 className="w-4 h-4 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider">System Ready To Verify</span>
            </div>
            <div className="flex gap-3">
              <button 
                type="button" 
                onClick={onClose}
                className="px-6 py-3 rounded-lg text-xs font-bold text-slate-500 uppercase tracking-wider hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                disabled={isSubmitting || (apiKey.length > 0 && apiKey.length < 16) || (secretKey.length > 0 && secretKey.length < 16) || !apiKey}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-8 py-3 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)]"
              >
                {isSubmitting ? (
                  <>
                    <Activity className="w-4 h-4 animate-spin" />
                    Initializing...
                  </>
                ) : (
                  <>
                    Verify & Connect
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
