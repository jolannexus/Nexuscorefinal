import React, { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Loader2, QrCode } from 'lucide-react';
import { cn } from '../../utils/cn';

interface QRISPaymentValidatorProps {
  depositId: string;
  onSuccess?: () => void;
  className?: string;
}

export const QRISPaymentValidator = ({ depositId, onSuccess, className }: QRISPaymentValidatorProps) => {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<'PENDING' | 'SUCCESS' | 'FAILED'>('PENDING');

  useEffect(() => {
    if (!depositId || status !== 'PENDING') return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/payment/deposit/sync/${depositId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'SUCCESS' || data.status === 'CONFIRMED' || data.status === 'COMPLETED') {
            setStatus('SUCCESS');
            clearInterval(interval);
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            if (onSuccess) onSuccess();
          } else if (data.status === 'FAILED' || data.status === 'REJECTED') {
            setStatus('FAILED');
            clearInterval(interval);
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
          }
        }
      } catch (err) {
        
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [depositId, status, queryClient, onSuccess]);

  if (status === 'SUCCESS') {
    return (
      <div className={cn("flex items-center gap-2 text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20", className)}>
        <CheckCircle2 className="w-4 h-4" />
        <span className="text-[11px] font-bold uppercase tracking-wider">Payment Verified</span>
      </div>
    );
  }

  if (status === 'FAILED') {
    return (
      <div className={cn("flex items-center gap-2 text-rose-500 bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/20", className)}>
        <span className="text-[11px] font-bold uppercase tracking-wider">Verification Failed</span>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-3 text-amber-500 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20", className)}>
      <Loader2 className="w-4 h-4 animate-spin" />
      <span className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
        <QrCode className="w-3 h-3" />
        Awaiting QRIS Payment
      </span>
    </div>
  );
};
