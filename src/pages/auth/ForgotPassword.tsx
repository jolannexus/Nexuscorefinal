import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Mail, ArrowLeft, RefreshCw } from 'lucide-react';
import { authService } from '../../services/authService';
import { cn } from '../../utils/cn';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';

export const ForgotPassword = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);
    try {
      await authService.resetPassword(email);
      setMessage(t('auth.recoveryLinkSent'));
    } catch (err: any) {
      setError(err.message || t('auth.failedToSendRecovery'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-500 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl relative">
          <Link to="/login" className="absolute top-6 left-6 text-slate-500 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div className="flex flex-col items-center mb-8 pt-4">
            <div className="w-12 h-12 bg-amber-600 rounded-2xl flex items-center justify-center shadow-lg mb-4">
              <RefreshCw className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight text-center leading-tight">{t('auth.passwordRecovery')}</h1>
            <p className="text-xs text-slate-500 font-medium mt-1">{t('auth.accountSecurityProtocol')}</p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 font-semibold">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-6 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-400 font-semibold">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs text-slate-500 font-bold uppercase tracking-wider pl-1">{t('auth.email')}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="vortex-input pl-10"
                  placeholder="admin@nexuscore.io"
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading || !!message}
              className={cn(
                "vortex-button-primary w-full h-14 bg-amber-600 hover:bg-amber-500 flex items-center justify-center gap-2",
                (isLoading || !!message) && "opacity-50"
              )}
            >
              <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
              {isLoading ? t('auth.processing') : message ? t('auth.emailSent') : t('auth.sendRecoveryLink')}
            </button>
          </form>

          <div className="mt-8 text-center text-xs text-slate-500 font-medium">
            {t('auth.rememberedPassword')} {' '}
            <Link to="/login" className="text-amber-400 font-bold hover:text-white transition-colors ml-2">
              {t('auth.backToLogin')}
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
