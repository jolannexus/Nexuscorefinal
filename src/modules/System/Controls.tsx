import React, { useState } from 'react';
import { Zap } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { cn } from '../../utils/cn';

export const MissionCriticalControls = () => {
  const [states, setStates] = useState({
    maintenance: false,
    failover: true,
    fraudShield: true
  });

  return (
    <Card className="border-slate-800 bg-slate-900/30">
      <SectionHeader title="18. System Controls" icon={Zap} colorClass="text-blue-400" />
      <div className="grid grid-cols-1 gap-2">
        {Object.entries(states).map(([key, val]) => (
          <button 
            key={key}
            onClick={() => setStates({...states, [key]: !val})}
            className={cn(
              "flex items-center justify-between p-2 rounded border transition-all",
              val ? "bg-blue-600/10 border-blue-500/30" : "bg-slate-950 border-slate-800 opacity-50"
            )}
          >
            <span className="text-xs font-bold uppercase text-white tracking-wider">
              {key.replace(/([A-Z])/g, '_$1')}
            </span>
            <div className={cn(
              "w-6 h-3 rounded-full relative transition-colors",
              val ? "bg-blue-500" : "bg-slate-700"
            )}>
              <div className={cn(
                "absolute top-0.5 w-2 h-2 rounded-full bg-white transition-all",
                val ? "right-0.5" : "left-0.5"
              )} />
            </div>
          </button>
        ))}
      </div>
    </Card>
  );
};
