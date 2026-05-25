import React from 'react';
import { motion } from 'motion/react';

export const StatusTicker = () => (
  <div className="bg-primary h-7 flex items-center overflow-hidden whitespace-nowrap border-b border-primary/20 relative z-50">
    <motion.div 
      animate={{ x: [0, -1000] }}
      transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      className="flex items-center gap-16"
    >
      {[...Array(10)].map((_, i) => (
        <div key={i} className="flex items-center gap-6">
          <span className="text-xs font-bold text-slate-950 uppercase tracking-wider">ADMINISTRATOR VIEW</span>
          <div className="w-1 h-1 bg-slate-950/20 rounded-full" />
          <span className="text-xs text-slate-900/60 font-medium">LATENCY: 8ms</span>
          <span className="text-xs text-slate-900/60 font-medium">REGION: ASIA-EAST</span>
          <span className="text-xs text-slate-900/60 font-medium">System Health: Optimal</span>
        </div>
      ))}
    </motion.div>
  </div>
);
