import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Settings2, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  Database, 
  Trash2,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  ArrowRightLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSuppliers } from '../../hooks/useSuppliers';
import { SupplierConnectForm } from './SupplierConnectForm';
import { SupplierIntegrationGrid } from './SupplierIntegrationGrid';
import { cn } from '../../utils/cn';
import { format } from 'date-fns';
import { SupplierConnection } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

export const SupplierModule = () => {
  const { connections, loading, deleteConnection, syncConnection, syncProducts } = useSuppliers();
  const safeConnections = Array.isArray(connections) ? connections : [];
  const { profile } = useAuth();
  const [showConnectForm, setShowConnectForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [syncingProductsId, setSyncingProductsId] = useState<string | null>(null);
  const [configParams, setConfigParams] = useState<{ id?: string, supplierId?: string, connection?: SupplierConnection | null }>({});
  const [supplierSwaps, setSupplierSwaps] = useState<any[]>([]);

  useEffect(() => {
    // Hooks reserved for API integration
  }, [profile?.agencyId]);

  const handleSync = async (id: string) => {
    setSyncingId(id);
    try {
      await syncConnection(id);
    } catch (err) {
      setError('Gagal memuat data provider.');
    } finally {
      setSyncingId(null);
    }
  };

  const handleSyncProducts = async (id: string) => {
    setSyncingProductsId(id);
    try {
      await syncProducts(id);
    } catch (err) {
      setError('Gagal melakukan aksi ini.');
    } finally {
      setSyncingProductsId(null);
    }
  };

  const handleConfigure = (supplierId: string, connection?: SupplierConnection) => {
    setConfigParams({
      supplierId,
      connection: connection || null
    });
    setShowConnectForm(true);
  };

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white uppercase tracking-wider flex items-center gap-3">
            <Database className="w-5 h-5 text-blue-500" />
            Active Providers
          </h2>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">
            Currently synchronized infrastructure connections
          </p>
        </div>
        {!loading && connections.length > 0 && (
          <button 
            onClick={() => handleConfigure('')}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)] active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Add Provider
          </button>
        )}
      </div>

      {loading && !safeConnections.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-slate-900/50 border border-slate-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : safeConnections.length === 0 ? (
        <div className="bg-slate-900/20 border-2 border-dashed border-slate-800 rounded-[32px] p-16 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-slate-800 rounded-3xl flex items-center justify-center mb-6 shadow-2xl">
            <Settings2 className="w-10 h-10 text-slate-600" />
          </div>
          <h3 className="text-slate-400 font-bold uppercase tracking-wider mb-3">No suppliers connected</h3>
          <p className="text-xs text-slate-500 font-medium max-w-sm mb-8 leading-relaxed">
            Connect your first supplier to activate your monetization catalog. Integrate via API to sync pricing and inventory automatically.
          </p>
          <button 
            onClick={() => handleConfigure('')}
            className="bg-primary text-slate-950 px-8 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-emerald-500 transition-all shadow-xl active:scale-95"
          >
            Connect Supplier
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {safeConnections.map((conn) => (
            <motion.div 
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              key={conn.id}
              className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-2xl p-5 hover:border-blue-500/30 transition-all group"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-tight">{conn.supplierName}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={cn(
                      "w-2 h-2 rounded-full animate-pulse",
                      conn.status === 'ACTIVE' ? "bg-emerald-500" : conn.status === 'ERROR' ? "bg-red-500" : "bg-slate-500"
                    )} />
                    <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
                      STATUS // {conn.status}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleConfigure(conn.supplierName.toLowerCase(), conn)}
                    className="p-2 bg-white/5 rounded-lg hover:bg-white/10 text-slate-400 transition-all"
                    title="Edit Configuration"
                  >
                    <Settings2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleSync(conn.id)}
                    disabled={syncingId === conn.id}
                    className="p-2 bg-white/5 rounded-lg hover:bg-white/10 text-slate-400 transition-all disabled:opacity-50"
                  >
                    <RefreshCw className={cn("w-4 h-4", syncingId === conn.id && "animate-spin text-blue-500")} />
                  </button>
                  <button 
                    onClick={() => handleSyncProducts(conn.id)}
                    disabled={syncingProductsId === conn.id}
                    className="p-2 bg-white/5 rounded-lg hover:bg-white/10 text-slate-400 transition-all disabled:opacity-50"
                    title="Sync Products"
                  >
                    <Database className={cn("w-4 h-4", syncingProductsId === conn.id && "animate-spin text-emerald-500")} />
                  </button>
                  <button 
                    onClick={() => deleteConnection(conn.id)}
                    className="p-2 bg-white/5 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-slate-600 font-bold uppercase tracking-wider">Access Token Hash</span>
                  <div className="flex items-center gap-2 bg-slate-950/50 rounded px-2 py-1.5 border border-slate-800">
                    <ShieldCheck className="w-3 h-3 text-emerald-500" />
                    <span className="text-xs text-slate-400 font-mono">••••••••{conn.apiKey.slice(-6)}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-slate-600 font-bold uppercase tracking-wider">Reseller ID</span>
                    <span className="text-xs text-white font-mono">{conn.resellerId || 'N/A'}</span>
                  </div>
                  <div className="flex flex-col gap-1 items-end">
                    <span className="text-xs text-slate-600 font-bold uppercase tracking-wider text-right">Region Code</span>
                    <span className="text-xs text-blue-400 font-mono">ASIA-SING-1</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-xs text-slate-600 font-bold uppercase tracking-wider">Last Data Sync</span>
                  <span className="text-xs text-slate-400 font-mono">{conn.lastSyncAt ? format(conn.lastSyncAt.toDate(), 'HH:mm:ss // MM.dd') : 'NEVER'}</span>
                </div>
                <button className="text-slate-500 hover:text-white transition-colors">
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Supplier Swap Events Widget */}
      {connections.length > 0 && supplierSwaps.length > 0 && (
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <ArrowRightLeft className="w-5 h-5 text-orange-400" />
            </div>
            <div>
               <h3 className="text-white font-bold tracking-tight">Supplier Swap Events</h3>
               <p className="text-sm text-slate-500">Recent automatic failover swaps across your infrastructure.</p>
            </div>
          </div>

          <div className="space-y-3">
            {supplierSwaps.map((swap) => (
              <div key={swap.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-950/50 rounded-2xl border border-slate-800/50 gap-4">
                 <div className="flex flex-col gap-1">
                   <div className="flex items-center gap-2">
                     <span className="text-xs font-bold text-slate-400">{swap.orderId}</span>
                     <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">{swap.productName}</span>
                   </div>
                   <div className="text-sm">
                      <span className="text-red-400 font-medium line-through mr-2">{swap.primarySupplier}</span>
                      <ArrowRightLeft className="inline w-3 h-3 text-slate-600 mx-1" />
                      <span className="text-emerald-400 font-bold ml-2">{swap.fallbackSupplier}</span>
                   </div>
                 </div>
                 <div className="flex flex-col items-end">
                   <span className="text-xs text-orange-400/80 bg-orange-400/10 px-2 py-1 rounded max-w-xs text-right truncate">
                     {swap.reason}
                   </span>
                   <span className="text-xs text-slate-500 mt-1 font-mono">
                     {swap.createdAt ? format(swap.createdAt.toDate(), 'HH:mm:ss // MM.dd') : 'Pending...'}
                   </span>
                 </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Configuration Grid Section */}
      <SupplierIntegrationGrid 
        connections={connections}
        onConfigure={handleConfigure}
      />

      <AnimatePresence>
        {showConnectForm && (
          <SupplierConnectForm 
            onClose={() => {
              setShowConnectForm(false);
              setConfigParams({});
            }} 
            initialData={configParams.connection}
            supplierId={configParams.supplierId}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
