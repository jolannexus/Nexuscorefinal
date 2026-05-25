import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Activity, 
  LogOut, 
  User as UserIcon, 
  LayoutDashboard, 
  Database, 
  Users, 
  Package, 
  Settings, 
  LifeBuoy,
  Lock,
  Menu,
  X,
  Cpu,
  Zap,
  Megaphone,
  CreditCard,
  Palette,
  History,
  Video,
  Gamepad2,
  Bell,
  Search,
  Terminal
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../utils/cn';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';
import { authService } from '../../services/authService';
import { BRAND } from '../../config/branding';

export const Header = () => {
  const { role, user } = useAuth();
  const { tenant } = useTenant();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isMobileMenuOpen]);

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Transactions', path: '/history', icon: Activity },
    { label: 'Providers', path: '/suppliers', icon: Cpu, roles: ['SUPER_ADMIN', 'AGENCY'] },
    { label: 'Resellers', path: '/resellers', icon: Users, roles: ['SUPER_ADMIN', 'AGENCY'] },
    { label: 'Products', path: '/catalog', icon: Package, roles: ['SUPER_ADMIN', 'AGENCY'] },
    { label: 'Settings', path: '/system', icon: Settings, roles: ['SUPER_ADMIN', 'PLATFORM_ADMIN'] },
    { label: 'Ops Desk', path: '/operations', icon: Terminal, roles: ['SUPER_ADMIN', 'PLATFORM_ADMIN'] },
  ];

  return (
    <header className="bg-black/80 backdrop-blur-2xl border-b border-white/10 px-4 lg:px-8 py-3.5 flex justify-between items-center shrink-0 sticky top-0 z-50">
      <div className="flex items-center gap-10">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-black shadow-sm transition-all group-hover:scale-105 duration-200">
            <Cpu className="w-5 h-5 animate-pulse" />
          </div>
          <div className="hidden min-[450px]:block">
            <h1 className="text-sm font-bold text-white tracking-tight leading-none">
              {BRAND.name}
            </h1>
            <p className="text-[10px] text-emerald-400 font-semibold tracking-wider uppercase mt-1">
              Platform Gateway
            </p>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-1.5 p-1 bg-white/[0.02] border border-white/5 rounded-xl">
          {navItems.map((item) => {
            if (item.roles && role && !item.roles.includes(role)) return null;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-300",
                  isActive 
                    ? "bg-white/10 text-white shadow-sm" 
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden xl:flex items-center gap-6 px-6 border-r border-white/5">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 uppercase font-semibold tracking-widest mb-0.5">Network Status</span>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs text-emerald-500 font-medium">Operational</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2.5 px-3 py-1.5 bg-white/[0.03] border border-white/5 rounded-lg focus-within:border-white/20 transition-all group">
            <Search className="w-3.5 h-3.5 text-slate-400 group-focus-within:text-white" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="bg-transparent border-none outline-none text-xs text-white placeholder:text-slate-600 w-24 xl:w-32"
            />
          </div>

          <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-white/5">
             <div className="flex flex-col text-right">
                <span className="text-[11px] text-white font-medium">{user?.email?.split('@')[0]}</span>
                <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-widest">{role?.replace('_', ' ')}</span>
             </div>
             <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                 <UserIcon className="w-4 h-4 text-slate-300" />
             </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2.5 bg-white/5 border border-white/5 text-slate-300 hover:text-white transition-all rounded-xl hover:bg-white/10">
              <Bell className="w-4 h-4" />
            </button>
            <button 
              onClick={handleLogout}
              className="p-2.5 bg-white/5 border border-white/5 text-slate-300 hover:text-white transition-all rounded-xl hover:bg-white/10"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
          
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 active:scale-95 text-white rounded-xl transition-all"
          >
            <Menu className="w-5 h-5 text-slate-200" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9990] lg:hidden"
            />
            <motion.div
              initial={{ opacity: 0, y: -15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.95 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute top-16 right-4 left-4 bg-zinc-950 border border-white/15 rounded-2xl p-4.5 z-[9999] lg:hidden flex flex-col gap-4 shadow-2xl shadow-black/90"
            >
              {/* Profile Row with Close Button */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold shadow-sm">
                    <UserIcon className="w-4.5 h-4.5" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-white truncate leading-tight">{user?.email?.split('@')[0]}</span>
                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider leading-none mt-1">{role?.replace('_', ' ')}</span>
                  </div>
                </div>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)} 
                  className="p-2 bg-white/5 border border-white/10 text-zinc-300 hover:text-white rounded-lg transition-all active:scale-95"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Navigation Items Grid - 2 columns, high-contrast, zero-scroll */}
              <div className="grid grid-cols-2 gap-2.5">
                {navItems.map((item) => {
                  if (item.roles && role && !item.roles.includes(role)) return null;
                  const isActive = location.pathname === item.path;
                  const Icon = item.icon;
                  
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "flex flex-col items-center justify-center p-3 rounded-xl text-center gap-1.5 transition-all duration-200 border-2",
                        isActive 
                          ? "text-black bg-emerald-400 border-emerald-300 font-extrabold shadow-lg shadow-emerald-500/10" 
                          : "text-zinc-100 hover:text-white bg-zinc-900 border-white/5 font-semibold"
                      )}
                    >
                      <Icon className={cn("w-5 h-5", isActive ? "text-black" : "text-emerald-400")} />
                      <span className="text-xs font-bold">{item.label}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Clear Standout Sign Out Option */}
              <button 
                onClick={handleLogout}
                className="w-full py-3.5 bg-red-600 hover:bg-red-500 border border-red-700/30 text-white rounded-xl font-bold text-xs active:scale-98 transition-all flex items-center justify-center gap-2.5 shadow-md shadow-red-950/20"
              >
                <LogOut className="w-4 h-4" />
                Sign Out Account
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};
