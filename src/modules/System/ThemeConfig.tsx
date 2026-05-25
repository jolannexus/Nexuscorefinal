import React, { useState } from 'react';
import { Palette } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { SectionHeader } from '../../components/ui/SectionHeader';

export const ThemeConfig = () => {
  const [colors, setColors] = useState({
    primary: '#3b82f6',
    secondary: '#10b981',
    accent: '#f59e0b'
  });

  return (
    <Card className="border-pink-900/40 bg-pink-950/5">
      <SectionHeader title="10. Branding Theme" icon={Palette} colorClass="text-pink-400" />
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(colors).map(([key, val]) => (
            <div key={key} className="space-y-1.5">
              <label className="text-xs text-slate-500 font-bold uppercase tracking-tight">{key}</label>
              <div className="relative group">
                <input 
                  type="color" 
                  value={val}
                  onChange={(e) => setColors({...colors, [key]: e.target.value})}
                  className="w-full h-8 bg-slate-950 border border-slate-800 rounded cursor-pointer overflow-hidden p-0"
                />
                <div className="absolute inset-0 pointer-events-none border border-slate-800 rounded group-hover:border-white/20 transition-colors" />
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 relative group overflow-hidden">
           <div 
             className="absolute inset-0 opacity-10 pointer-events-none" 
             style={{ backgroundColor: colors.primary }}
           />
           <div className="relative space-y-2">
             <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: colors.primary }} />
                <div className="h-1.5 w-20 rounded" style={{ backgroundColor: colors.primary, opacity: 0.4 }} />
             </div>
             <div className="h-1 w-full rounded bg-slate-800" />
             <div className="flex justify-between items-center">
                <div className="h-5 w-16 rounded text-xs flex items-center justify-center font-bold text-white uppercase tracking-tight" style={{ backgroundColor: colors.accent }}>
                  BUY_NOW
                </div>
                <div className="flex flex-col items-end gap-1">
                   <div className="h-1 w-10 rounded" style={{ backgroundColor: colors.secondary }} />
                   <div className="h-1 w-6 rounded" style={{ backgroundColor: colors.secondary, opacity: 0.5 }} />
                </div>
             </div>
           </div>
        </div>
        
        <p className="text-sm text-slate-500 font-medium text-center">Storefront simulation view active</p>
      </div>
    </Card>
  );
};
