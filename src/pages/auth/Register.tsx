import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, UserPlus, Shield, Globe } from 'lucide-react';
import { authService } from '../../services/authService';
import { cn } from '../../utils/cn';
import { motion } from 'motion/react';
import { Role } from '../../types/index';
import { useTenant } from '../../contexts/TenantContext';

export const Register = () => {
  const { tenant } = useTenant();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>(tenant ? 'RESELLER' : 'AGENCY');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await authService.register(email, password, tenant?.id, role);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
        <div 
          className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[120px]" 
          style={{ backgroundColor: tenant?.theme?.primary || '#10b981' }}
        />
        <div 
          className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px]" 
          style={{ backgroundColor: tenant?.theme?.secondary || '#3b82f6' }}
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl relative">
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg mb-4 overflow-hidden"
                 style={{ backgroundColor: tenant?.theme?.primary || '#059669' }}>
               {tenant?.logoUrl ? (
                <img src={tenant.logoUrl} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <Shield className="w-6 h-6 text-white" />
              )}
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              {tenant ? `${tenant.name} Join` : 'Create Workspace'}
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-1">
              {tenant ? `Enterprise Onboarding` : 'Digital Monetization Platform'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 font-semibold flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs text-slate-500 font-bold uppercase tracking-wider pl-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="vortex-input pl-10"
                  placeholder="name@company.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-500 font-bold uppercase tracking-wider pl-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="vortex-input pl-10"
                  placeholder="••••••••••••"
                  required
                />
              </div>
            </div>

            {!tenant && (
              <div className="space-y-1.5">
                <label className="text-xs text-slate-500 font-bold uppercase tracking-wider pl-1">Account Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['AGENCY', 'RESELLER'] as Role[]).map((r) => (
                    <button 
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={cn(
                        "py-2 text-xs font-bold rounded-xl border transition-all uppercase tracking-wide",
                        role === r 
                          ? "bg-primary border-primary text-slate-950" 
                          : "bg-slate-950 border-slate-800 text-slate-500"
                      )}
                    >
                      {r === 'AGENCY' ? 'Agency' : 'Reseller'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button 
              type="submit"
              disabled={isLoading}
              className={cn(
                "vortex-button-primary w-full py-4 text-sm font-bold uppercase tracking-wider gap-2 mt-4",
                isLoading && "opacity-70"
              )}
            >
              <UserPlus className="w-4 h-4" />
              {isLoading ? 'Activating...' : 'Launch Workspace'}
            </button>
          </form>

          <div className="mt-8 text-center text-xs text-slate-500 font-medium">
            Already have an account? {' '}
            <Link to="/login" className="text-primary font-bold hover:text-white transition-colors ml-2">
              Sign In
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
