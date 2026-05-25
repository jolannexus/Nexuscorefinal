import React, { useState } from 'react';
import { 
  DollarSign, 
  Percent, 
  Zap, 
  ArrowRight, 
  CheckCircle2,
  Trash2,
  Target
} from 'lucide-react';
import { pricingService, PricingRule } from '../../services/products/pricingService';
import { cn } from '../../utils/cn';

interface BulkPricingControlProps {
  categories: string[];
  platforms: string[];
  onComplete: () => void;
}

export const BulkPricingControl: React.FC<BulkPricingControlProps> = ({ categories, platforms, onComplete }) => {
  const [rule, setRule] = useState<PricingRule>({
    targetType: 'CATEGORY',
    targetValue: categories[0] || '',
    marginType: 'PERCENTAGE',
    marginValue: 10
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await pricingService.applyRule(rule);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onComplete();
      }, 2000);
    } catch (err) {
      console.error('Failed to apply pricing rule:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900/60 backdrop-blur-2xl border border-slate-800 rounded-[32px] p-8 shadow-2xl overflow-hidden relative group">
      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
        <Target className="w-32 h-32 text-purple-500" />
      </div>

      <div className="relative z-10 space-y-6">
        <div>
          <h3 className="text-xl font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-3">
            <Zap className="w-5 h-5 text-purple-500" />
            Pricing Control
          </h3>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
            Apply dynamic profit margins across infrastructure segments
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Target Selection */}
          <div className="space-y-4">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block ml-1">Target Segment</label>
            <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800">
              <button 
                onClick={() => setRule({ ...rule, targetType: 'CATEGORY', targetValue: categories[0] || '' })}
                className={cn(
                  "flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all",
                  rule.targetType === 'CATEGORY' ? "bg-white text-slate-950" : "text-slate-500 hover:text-white"
                )}
              >
                Category
              </button>
              <button 
                onClick={() => setRule({ ...rule, targetType: 'PLATFORM', targetValue: platforms[0] || '' })}
                className={cn(
                  "flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all",
                  rule.targetType === 'PLATFORM' ? "bg-white text-slate-950" : "text-slate-500 hover:text-white"
                )}
              >
                Platform
              </button>
            </div>

            <select 
              value={rule.targetValue}
              onChange={(e) => setRule({ ...rule, targetValue: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-xs font-medium text-white outline-none focus:border-purple-500/50 appearance-none cursor-pointer"
            >
              {(rule.targetType === 'CATEGORY' ? categories : platforms).map(val => (
                <option key={val} value={val}>{val}</option>
              ))}
            </select>
          </div>

          {/* Margin Configuration */}
          <div className="space-y-4">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block ml-1">Profit Strategy</label>
            <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800">
              <button 
                onClick={() => setRule({ ...rule, marginType: 'PERCENTAGE' })}
                className={cn(
                  "flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2",
                  rule.marginType === 'PERCENTAGE' ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "text-slate-500"
                )}
              >
                <Percent className="w-3 h-3" />
                Percentage
              </button>
              <button 
                onClick={() => setRule({ ...rule, marginType: 'FIXED' })}
                className={cn(
                  "flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2",
                  rule.marginType === 'FIXED' ? "bg-blue-500/10 text-blue-500 border border-blue-500/20" : "text-slate-500"
                )}
              >
                <DollarSign className="w-3 h-3" />
                Fixed
              </button>
            </div>

            <div className="relative">
              <input 
                type="number"
                value={rule.marginValue}
                onChange={(e) => setRule({ ...rule, marginValue: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-xl font-mono font-bold text-white outline-none focus:border-purple-500/50"
              />
              <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs uppercase tracking-wider">
                {rule.marginType === 'PERCENTAGE' ? 'Percent' : 'USD'}
              </div>
            </div>
          </div>
        </div>

        <button 
          onClick={handleSubmit}
          disabled={loading || success}
          className={cn(
            "w-full py-5 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-3 transition-all",
            success 
              ? "bg-emerald-500 text-white" 
              : "bg-white hover:bg-slate-200 text-slate-950 shadow-xl active:scale-95"
          )}
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
          ) : success ? (
            <>
              <CheckCircle2 className="w-5 h-5" />
              Rule Applied Successfully
            </>
          ) : (
            <>
              Execute Pricing Sync
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
