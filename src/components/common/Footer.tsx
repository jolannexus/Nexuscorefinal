import React from 'react';
import { Activity } from 'lucide-react';

export const Footer = () => (
  <footer className="bg-slate-900 border-t border-slate-800 p-2 flex justify-between items-center px-4 shrink-0">
    <div className="flex items-center gap-6">
      <div className="flex items-center gap-2">
        <Activity className="w-3 h-3 text-emerald-500" />
        <span className="text-xs text-slate-600 font-medium uppercase font-bold italic">Network Stable</span>
      </div>
      <p className="text-xs font-medium text-slate-700 tracking-wider hidden md:block uppercase"></p>
    </div>
    <div className="flex items-center gap-2">
      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
      <span className="text-xs text-slate-500 font-medium uppercase font-bold">2026 VORTEX CORE LABORATORY</span>
    </div>
  </footer>
);
