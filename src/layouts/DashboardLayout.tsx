import React from 'react';
import { Header } from '../components/common/Header';
import { useTenant } from '../contexts/TenantContext';
import { BRAND } from '../config/branding';
import { Activity, ShieldCheck, Cpu } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { tenant } = useTenant();
  
  return (
    <div className="min-h-screen w-full flex flex-col bg-black font-sans selection:bg-white/20 selection:text-white text-slate-200">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/[0.03] via-black to-black">
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[150px] rounded-full opacity-50" />
      </div>

      <Header />
      
      <main className="flex-1 relative z-10">
        <div className="max-w-[1400px] mx-auto p-4 sm:p-8 lg:px-12">
          {children}
          
          <footer className="mt-24 border-t border-white/5 pt-12 pb-24 flex flex-col lg:flex-row justify-between items-center gap-8 text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
            <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-12 w-full justify-between">
              <span>&copy; 2026 {BRAND.name} Platform</span>
              <div className="flex gap-8">
                <a href="#" className="hover:text-white transition-colors">Legal</a>
                <a href="#" className="hover:text-white transition-colors">Support</a>
              </div>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
};
