import React, { useState } from 'react';
import { 
  Shield, 
  Key, 
  Settings2, 
  CheckCircle2, 
  Clock,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Database,
  Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supplierRegistry } from '../../adapters/suppliers/registry';
import { SupplierConnection } from '../../types/index';
import { cn } from '../../utils/cn';

interface SupplierIntegrationGridProps {
  connections: SupplierConnection[];
  onConfigure: (supplierId: string, connection?: SupplierConnection) => void;
}

export const SupplierIntegrationGrid = ({ connections, onConfigure }: SupplierIntegrationGridProps) => {
  const adapters = supplierRegistry.getAllAdapters();

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-2">
          <Settings2 className="w-4 h-4 text-blue-500" />
          Integration Matrix
        </h3>
        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
          Configure secure authentication channels for global nodes
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {adapters.map((adapter) => {
          const connection = connections.find(c => c.supplierName === adapter.name);
          const isConnected = !!connection;

          return (
            <motion.div
              layout
              key={adapter.id}
              className={cn(
                "group relative bg-slate-900/40 border rounded-2xl p-6 transition-all",
                isConnected ? "border-emerald-500/20" : "border-slate-800"
              )}
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center border font-mono font-bold text-xl",
                    isConnected ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-slate-950 border-slate-800 text-slate-700"
                  )}>
                    {adapter.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white uppercase tracking-tight">{adapter.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        isConnected ? "bg-emerald-500" : "bg-slate-700"
                      )} />
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        {isConnected ? "Status: Connected" : "Status: Disconnected"}
                      </span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => onConfigure(adapter.id, connection)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border",
                    isConnected 
                      ? "bg-white/5 border-slate-800 text-white hover:bg-white/10" 
                      : "bg-blue-600 border-blue-500 text-white hover:bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.2)]"
                  )}
                >
                  {isConnected ? "Manage Connection" : "Connect Provider"}
                </button>
              </div>

              {isConnected ? (
                <div className="space-y-3">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-xs text-slate-600 font-bold uppercase tracking-wider">
                      <span>Live Credential Sync</span>
                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />
                    </div>
                    <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
                       <div className="flex items-center gap-2">
                          <Lock className="w-3 h-3 text-slate-500" />
                          <span className="text-xs text-slate-400 font-mono tracking-wider">••••••••{connection.apiKey.slice(-4)}</span>
                       </div>
                       <span className="text-xs text-slate-600 font-mono">ID: {connection.resellerId}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-950 border border-dashed border-slate-800 rounded-xl flex items-center justify-center">
                  <span className="text-xs text-slate-600 font-bold uppercase tracking-wider italic">Awaiting secure handshake configuration</span>
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-600 font-bold uppercase tracking-wider">API Base Endpoint</span>
                    <span className="text-xs text-slate-500 font-mono">{adapter.id.toLowerCase()}.vortex-api.nexus</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                   <div className="px-2 py-1 bg-white/5 rounded text-xs font-medium text-slate-500 uppercase tracking-wider">v1.2.0</div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
