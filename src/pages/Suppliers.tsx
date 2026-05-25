import React from 'react';
import { SupplierModule } from '../modules/suppliers/SupplierModule';

export const Suppliers = () => {
  return (
    <div className="max-w-7xl mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">Providers</h1>
        <p className="text-sm text-slate-500 font-medium mt-1 flex items-center gap-2">
          Connect and manage your product providers
        </p>
      </div>

      <SupplierModule />

      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Secure Connections</h4>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            Your API keys are encrypted and securely stored. We never expose your credentials to resellers or customers.
          </p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Automatic Updates</h4>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            Keep your product catalog, pricing, and balances automatically synced with your providers.
          </p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">High Reliability</h4>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            Built-in redundancies ensure your transactions are processed smoothly even during peak times.
          </p>
        </div>
      </div>
    </div>
  );
};

