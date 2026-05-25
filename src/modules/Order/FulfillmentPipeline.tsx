import React, { useState } from 'react';
import { Wallet, ShieldCheck, Zap, TrendingUp } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { cn } from '../../utils/cn';
import { apiService } from '../../services/api.service';

export const FulfillmentPipeline = () => {
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [orderLogs, setOrderLogs] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [agencyBalance] = useState(250000); 

  const steps = [
    { label: 'Payment Receive', icon: Wallet, desc: 'Gateway verified payment' },
    { label: 'Balance Hold', icon: ShieldCheck, desc: 'Allocating capital' },
    { label: 'Supplier Request', icon: Zap, desc: 'Firing request to Supplier' },
    { label: 'Delivery Success', icon: TrendingUp, desc: 'ID Player top-up OK' }
  ];

  const handleTestFulfill = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    
    // Step 0: Payment Receive
    setActiveStep(0);
    await new Promise(r => setTimeout(r, 800));

    // Step 1: Balance Hold
    setActiveStep(1);
    await new Promise(r => setTimeout(r, 800));

    try {
      // Step 2: Supplier Request
      setActiveStep(2);
      const data = await apiService.fulfillOrder({
        sku: 'ML_100_DM',
        amount: 14200,
        userId: 'user_' + Math.floor(Math.random() * 1000),
        agencyBalance: agencyBalance
      });

      if (data.success) {
        // Step 3: Delivery Success
        setActiveStep(3);
        setOrderLogs(prev => [data, ...prev].slice(0, 3));
      }
    } catch (error) {
      console.error("Fulfillment error:", error);
    } finally {
      setTimeout(() => {
        setIsProcessing(false);
        setActiveStep(null);
      }, 2000);
    }
  };

  return (
    <Card className="border-blue-900/40 bg-blue-950/5 h-full flex flex-col">
      <div className="p-4 flex items-center justify-between border-b border-slate-800">
        <SectionHeader title="30. Fulfillment Pipeline" icon={Zap} colorClass="text-blue-400" />
        <button 
          onClick={handleTestFulfill}
          disabled={isProcessing}
          className="px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded uppercase hover:bg-blue-500 disabled:opacity-50 transition-all"
        >
          {isProcessing ? 'RUNNING' : 'RUN TEST'}
        </button>
      </div>
      
      <div className="flex-1 relative p-4 space-y-4">
        <div className="absolute left-6 top-4 bottom-4 w-[1px] bg-slate-800" />
        <div className="space-y-4">
          {steps.map((step, i) => (
            <div key={i} className={cn(
              "relative flex items-start gap-4 transition-all duration-500",
              activeStep === i ? "opacity-100 scale-105" : "opacity-30 grayscale"
            )}>
              <div className={cn(
                "w-4 h-4 rounded-full z-10 flex items-center justify-center border",
                activeStep === i ? "bg-blue-500 border-blue-400 shadow-[0_0_10px_#3b82f6]" : "bg-slate-900 border-slate-700"
              )}>
                <step.icon className={cn("w-2 h-2 text-white", activeStep !== i && "text-slate-600")} />
              </div>
              <div className="flex-1 -mt-1">
                <p className="text-xs font-bold text-white uppercase tracking-tight">{step.label}</p>
                <p className="text-xs text-slate-500 font-mono italic">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {orderLogs.length > 0 && (
          <div className="mt-4 p-2 bg-slate-950 rounded border border-slate-800 space-y-1">
             <p className="text-xs text-slate-500 font-bold uppercase mb-1">Recent Success</p>
             {orderLogs.map((log, i) => (
               <div key={i} className="text-xs font-medium text-emerald-400 flex justify-between">
                 <span>{log.supplier} {"->"} {log.transactionId}</span>
                 <span>IDR {log.finalCost}</span>
               </div>
             ))}
          </div>
        )}
      </div>

      <div className="p-2 bg-slate-950/80 mt-auto border-t border-slate-800 text-center">
         <p className="text-xs text-slate-600 font-medium uppercase">
           Avg. Fulfillment Speed: <span className="text-emerald-500">1.8s</span>
         </p>
      </div>
    </Card>
  );
};
