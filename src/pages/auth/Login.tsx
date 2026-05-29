import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Mail, Lock, LogIn, Chrome, Cpu, ShieldAlert } from 'lucide-react';
import { authService } from '../../services/authService';
import { cn } from '../../utils/cn';
import { motion } from 'motion/react';
import { useTenant } from '../../contexts/TenantContext';
import { useAuth } from '../../contexts/AuthContext';
import { BRAND } from '../../config/branding';
import { BrandLogo } from '../../components/BrandLogo';
import { useTranslation } from 'react-i18next';

export const Login = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { tenant, isLoading: tenantLoading } = useTenant();
  const { refreshAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  if (tenantLoading) return null;

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await authService.login(email, password, tenant?.id);
      await refreshAuth();
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || t('auth.authFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.loginWithGoogle(tenant?.id);
      await refreshAuth();
      navigate(from, { replace: true });
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        // User closed the popup, silently ignore or allow them to use demo 
        return;
      }
      setError(err.message || t('auth.googleLoginFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/[0.03] via-black to-black">
        <div className="absolute top-[10%] left-[50%] -translate-x-1/2 w-[80%] h-[50%] bg-primary/5 blur-[160px] rounded-full opacity-60" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[400px] relative z-10"
      >
        <div className="bg-[#050505] backdrop-blur-2xl border border-white/10 rounded-2xl p-10 shadow-[0_8px_40px_rgba(0,0,0,0.8)] relative overflow-hidden">
          {/* Header */}
          <div className="flex flex-col items-center mb-8 text-center">
            <BrandLogo className="w-14 h-14 mb-6" />
            <h1 className="text-xl font-semibold text-white tracking-tight leading-none">{BRAND.name}</h1>
            <p className="text-[11px] text-slate-500 font-medium tracking-wide uppercase mt-2">
              {t('auth.digitalMonetization')}
            </p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-6 p-4 bg-red-500/[0.03] border border-red-500/10 rounded-xl text-xs text-red-500 font-medium flex items-center gap-3"
            >
              <ShieldAlert className="w-4 h-4 shrink-0" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleEmailLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[11px] text-slate-400 font-semibold px-1">{t('auth.email')}</label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-white transition-colors" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 pl-10 bg-black border border-white/10 rounded-xl text-white text-[13px] focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20 transition-all placeholder:text-slate-600"
                  placeholder="name@company.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <label className="text-[11px] text-slate-400 font-semibold">{t('auth.password')}</label>
                <Link to="/forgot-password" title="Recover Access" className="text-[11px] text-slate-500 hover:text-white transition-colors font-semibold">
                  {t('auth.forgotPassword')}
                </Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-white transition-colors" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 pl-10 bg-black border border-white/10 rounded-xl text-white text-[13px] focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20 transition-all placeholder:text-slate-600"
                  placeholder="••••••••••••"
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className={cn(
                "vortex-button-primary w-full h-11 flex items-center justify-center gap-2 text-xs font-semibold mt-6",
                isLoading && "opacity-70"
              )}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-[1.5px] border-black/20 border-t-black rounded-full animate-spin" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              {isLoading ? t('auth.verifying') : t('auth.signIn')}
            </button>
          </form>

          <div className="my-8 flex items-center gap-4">
            <div className="h-px flex-1 bg-white/[0.05]" />
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest shrink-0">{t('auth.or')}</span>
            <div className="h-px flex-1 bg-white/[0.05]" />
          </div>

          <button 
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full h-11 bg-white/[0.02] border border-white/10 rounded-xl text-[13px] font-medium text-slate-300 hover:text-white hover:bg-white/[0.05] hover:border-white/20 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
          >
            <Chrome className="w-4 h-4 text-slate-400" />
            {t('auth.continueWithGoogle')}
          </button>

          <div className="mt-8 text-center border-t border-white/5 pt-6">
            <p className="text-[11px] text-slate-500 font-medium tracking-wide">
              {t('auth.noAccount')} {' '}
              <Link to="/register" className="text-white font-semibold hover:underline transition-colors ml-1">
                {t('auth.createAccount')}
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center gap-1 opacity-60">
          <p className="text-[11px] text-slate-500 font-medium tracking-wide">
            © 2026 {BRAND.name} Platform
          </p>
          <p className="text-[10px] text-slate-600 font-medium uppercase tracking-widest mt-1">
            {t('auth.certifiedSecure')}
          </p>
        </div>
      </motion.div>
    </div>
  );
};
