import React, { useState } from 'react';
import { Landmark, Send, AlertTriangle } from 'lucide-react';
import { BillingService } from '../../services/billing/billingService';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { cn } from '../../utils/cn';

interface TopUpFormProps {
  onClose: () => void;
  resellerId: string;
  agencyId: string;
}

export const TopUpForm = ({ onClose, resellerId, agencyId }: TopUpFormProps) => {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('Bank Transfer');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !resellerId) return;

    setLoading(true);
    const success = await BillingService.requestDeposit({
      resellerId,
      agencyId,
      amount: Number(amount),
      paymentMethod: method
    });

    if (success) {
      setSubmitted(true);
      setTimeout(() => onClose(), 2000);
    }
    setLoading(false);
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Financial Uplink"
      subtitle="Submit capital addition request"
      maxWidth="lg"
    >
      {submitted ? (
        <div className="py-12 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto animate-bounce">
            <Send className="w-8 h-8 text-emerald-500" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-white tracking-tight">Request Transmitted</h3>
            <p className="text-[13px] text-slate-500 font-medium">Awaiting manual verification by HQ</p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest ml-1">Capital Amount (IDR)</label>
            <input 
              type="number" 
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="vortex-input text-2xl font-mono py-4"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest ml-1">Transfer Protocol</label>
            <div className="grid grid-cols-2 gap-3">
              {['Bank Transfer', 'QRIS', 'E-Wallet', 'Crypto'].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMethod(m)}
                  className={cn(
                    "p-3.5 rounded-xl border text-[13px] font-semibold transition-all",
                    method === m 
                      ? 'bg-white/10 border-white/20 text-white' 
                      : 'bg-[#050505] border-white/5 text-slate-400 hover:border-white/10 hover:text-white hover:bg-white/[0.02]'
                  )}
                >
                  {m.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 bg-amber-500/[0.02] border border-amber-500/20 rounded-xl flex items-start gap-4">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[12px] text-amber-200/70 leading-relaxed font-medium">
              WARNING: Fraudulent submissions will result in immediate node termination. Please transfer funds before submitting this uplink.
            </p>
          </div>

          <div className="pt-2">
            <Button 
              type="submit"
              loading={loading}
              disabled={!amount}
              block
              size="lg"
            >
              Confirm Deposit
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
