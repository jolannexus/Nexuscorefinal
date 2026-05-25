import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/Card';
import { CheckCircle2, Circle, ArrowRight } from 'lucide-react';

export const OnboardingWidget = () => {
  const navigate = useNavigate();

  const steps = [
    { title: 'Add your first provider', desc: 'Connect to Digiflazz or VipReseller', completed: false, route: '/system' },
    { title: 'Import products', desc: 'Sync catalog from your providers', completed: false, route: '/catalog' },
    { title: 'Create reseller network', desc: 'Add partners to sell your products', completed: false, route: '/resellers' },
  ];

  const value = (steps.filter(s => s.completed).length / steps.length) * 100;

  return (
    <Card className="mb-8 border-emerald-500/20 bg-emerald-500/[0.02]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-white">Welcome to NexusCore</h3>
          <p className="text-sm text-slate-400">Follow these steps to get your digital transaction business up and running.</p>
        </div>
        <div className="hidden md:flex flex-col items-end gap-2 w-48">
          <div className="flex justify-between w-full text-xs text-slate-500">
             <span>Setup Progress</span>
             <span className="font-semibold text-emerald-400">{Math.round(value)}%</span>
          </div>
          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
             <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${value}%` }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
         {steps.map((step, i) => (
            <button 
               key={i}
               onClick={() => navigate(step.route)}
               className="flex items-start gap-4 p-4 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-800 hover:border-slate-700 transition-all text-left group"
            >
               <div className="mt-0.5">
                  {step.completed ? (
                     <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : (
                     <Circle className="w-5 h-5 text-slate-500 group-hover:text-emerald-500 transition-colors" />
                  )}
               </div>
               <div className="flex-1">
                  <h4 className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">{step.title}</h4>
                  <p className="text-xs text-slate-500 mt-1">{step.desc}</p>
               </div>
               <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 transition-colors self-center opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0" />
            </button>
         ))}
      </div>
    </Card>
  );
};
