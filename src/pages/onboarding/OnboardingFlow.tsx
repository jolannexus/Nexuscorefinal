import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  Upload, 
  Palette, 
  Package, 
  Rocket, 
  ChevronRight, 
  Globe,
  Plus,
  Trash2
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuth } from '../../contexts/AuthContext';
import { tenantService } from '../../services/system/tenantService';
import { useNavigate } from 'react-router-dom';

const steps = [
  { id: 'workspace', title: 'Workspace', icon: Globe },
  { id: 'supplier', title: 'Supplier', icon: Package },
  { id: 'wallet', title: 'Wallet', icon: Plus },
  { id: 'catalog', title: 'Catalog', icon: Palette },
  { id: 'launch', title: 'Launch', icon: Rocket }
];

export const OnboardingFlow = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isInitializing, setIsInitializing] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [launchError, setLaunchError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    logo: '',
    color: '#10b981',
    syncSupplier: true,
    setupWallet: true,
  });

  // Redirect if already onboarded
  React.useEffect(() => {
    if (profile?.agencyId) {
      navigate('/');
    }
  }, [profile?.agencyId, navigate]);

  const nextStep = () => {
    if (currentStep === steps.length - 1) {
      handleLaunch();
    } else {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handleLaunch = async () => {
    if (!user) return;
    setIsInitializing(true);
    try {
      setErrorDetails(null);
      await tenantService.createAgency({
        ownerUid: user.uid,
        name: formData.name || 'Enterprise Workspace',
        slug: (formData.name || 'enterprise').toLowerCase().replace(/[^a-z0-9]/g, '_'),
        primaryColor: formData.color
      });
      
      navigate('/');
    } catch (error: any) {
      setLaunchError('Gagal meluncurkan. Periksa konfigurasi dan coba lagi.');
      setErrorDetails(error.message || 'Workspace setup failed. Check connection.');
      setIsInitializing(false);
    }
  };
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center py-20 px-4 font-sans selection:bg-emerald-500/30">
      <div className="w-full max-w-2xl mb-12 flex items-center justify-between px-2">
        <div className="flex flex-col">
          <h1 className="text-xl font-bold text-white tracking-tight uppercase">Platform Setup</h1>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Provisioning new environment</p>
        </div>
        <div className="flex gap-2">
          {steps.map((_, idx) => (
            <div 
              key={idx} 
              className={cn(
                "h-1.5 w-6 sm:w-10 rounded-full transition-all duration-500",
                currentStep >= idx ? "bg-emerald-500" : "bg-slate-800"
              )} 
            />
          ))}
        </div>
      </div>

      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden relative">
        <div className="p-8 sm:p-12">
          <AnimatePresence mode="wait">
            {currentStep === 0 && (
              <motion.div
                key="step-workspace"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="space-y-2 text-center">
                  <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">Phase 01</span>
                  <h2 className="text-3xl font-bold text-white tracking-tight pt-2">Create Workspace</h2>
                  <p className="text-slate-400 text-sm">Define the primary identity for your monetization environment.</p>
                </div>

                <div className="space-y-6 pt-4">
                  {errorDetails && currentStep === 0 && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-500 font-medium text-center">
                      {errorDetails}
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider pl-1">Organization Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. NexusCore Global"
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-sm text-white focus:border-emerald-500 outline-none transition-all placeholder:text-slate-600"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-wider pl-1">Brand Accent</label>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {['#3b82f6', '#ec4899', '#f97316', '#10b981', '#06b6d4', '#6366f1'].map(color => (
                          <button
                            key={color}
                            onClick={() => setFormData({...formData, color})}
                            className={cn(
                              "w-8 h-8 rounded-full transition-all ring-offset-slate-900 ring-offset-2",
                              formData.color === color && "ring-2 ring-white scale-110 shadow-lg"
                            )}
                            style={{ backgroundColor: color, boxShadow: formData.color === color ? `0 0 15px ${color}66` : 'none' }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 1 && (
              <motion.div
                key="step-supplier"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
              >
                <div className="space-y-2 text-center">
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-wider bg-blue-400/10 px-3 py-1 rounded-full border border-blue-400/20">Phase 02</span>
                  <h2 className="text-3xl font-bold text-white tracking-tight pt-2">Connect Supplier</h2>
                  <p className="text-slate-400 text-sm">Configure upstream API connections for digital goods.</p>
                </div>

                <div className="p-6 bg-slate-950 border border-slate-800 rounded-3xl relative overflow-hidden group">
                  <div className="flex items-center justify-between gap-6 relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-center">
                        <Globe className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Configure API Provider</h3>
                        <p className="text-xs text-slate-500 mt-1 uppercase">Link external inventory sources</p>
                      </div>
                    </div>
                    <div 
                      className={cn(
                        "w-12 h-6 rounded-full p-1 cursor-pointer transition-all duration-300",
                        formData.syncSupplier ? "bg-blue-500" : "bg-slate-800"
                      )}
                      onClick={() => setFormData({...formData, syncSupplier: !formData.syncSupplier})}
                    >
                      <div className={cn(
                        "w-4 h-4 rounded-full bg-white transition-all transform duration-300 shadow-sm",
                        formData.syncSupplier ? "translate-x-6" : "translate-x-0"
                      )} />
                    </div>
                  </div>
                </div>
                <div className="text-center text-xs text-slate-500 italic">Supplier integration can be postponed to the dashboard.</div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step-wallet"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
              >
                <div className="space-y-2 text-center">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider bg-indigo-400/10 px-3 py-1 rounded-full border border-indigo-400/20">Phase 03</span>
                  <h2 className="text-3xl font-bold text-white tracking-tight pt-2">Configure Wallet</h2>
                  <p className="text-slate-400 text-sm">Initialize ledger infrastructure for transaction processing.</p>
                </div>

                <div className="p-6 bg-slate-950 border border-slate-800 rounded-3xl relative overflow-hidden group">
                  <div className="flex items-center justify-between gap-6 relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-indigo-500" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Multi-tenant Ledger</h3>
                        <p className="text-xs text-slate-500 mt-1 uppercase">Enable local wallet tracking and balance constraints</p>
                      </div>
                    </div>
                    <div 
                      className={cn(
                        "w-12 h-6 rounded-full p-1 cursor-pointer transition-all duration-300",
                        formData.setupWallet ? "bg-indigo-500" : "bg-slate-800"
                      )}
                      onClick={() => setFormData({...formData, setupWallet: !formData.setupWallet})}
                    >
                      <div className={cn(
                        "w-4 h-4 rounded-full bg-white transition-all transform duration-300 shadow-sm",
                        formData.setupWallet ? "translate-x-6" : "translate-x-0"
                      )} />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                key="step-catalog"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
              >
                <div className="space-y-2 text-center">
                  <span className="text-xs font-bold text-purple-400 uppercase tracking-wider bg-purple-400/10 px-3 py-1 rounded-full border border-purple-400/20">Phase 04</span>
                  <h2 className="text-3xl font-bold text-white tracking-tight pt-2">Activate Catalog</h2>
                  <p className="text-slate-400 text-sm">Select products to offer in your monetization environment.</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 bg-slate-900 border border-emerald-500/20 rounded-2xl flex flex-col items-center justify-center gap-3 relative overflow-hidden text-center cursor-pointer hover:border-emerald-500/50 hover:bg-slate-800 transition-all">
                     <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center"><CheckCircle2 className="w-5 h-5 text-emerald-400"/></div>
                     <span className="text-xs font-bold text-white uppercase tracking-wider">Game Credits</span>
                  </div>
                  <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-3 relative overflow-hidden text-center cursor-pointer hover:border-slate-700 transition-all">
                     <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center"><Plus className="w-5 h-5 text-slate-400"/></div>
                     <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Digital Vouchers</span>
                  </div>
                  <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-3 relative overflow-hidden text-center cursor-pointer hover:border-slate-700 transition-all">
                     <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center"><Plus className="w-5 h-5 text-slate-400"/></div>
                     <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Subscriptions</span>
                  </div>
                  <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-3 relative overflow-hidden text-center cursor-pointer hover:border-slate-700 transition-all">
                     <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center"><Plus className="w-5 h-5 text-slate-400"/></div>
                     <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">E-Wallets</span>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 4 && (
              <motion.div
                key="step-launch"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-8 text-center"
              >
                <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto relative">
                   <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping opacity-20" />
                  <Rocket className="w-10 h-10 text-emerald-500" />
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-4xl font-bold text-white tracking-tight">Ready to Launch</h2>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Onboarding sequence complete.</p>
                </div>

                <div className="p-8 bg-slate-950 border border-slate-800 rounded-[32px] text-left relative overflow-hidden backdrop-blur-md shadow-xl">
                  <div className="space-y-4 relative z-10">
                    {errorDetails && (
                      <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-500 font-medium text-center">
                        {errorDetails}
                      </div>
                    )}
                    <div>
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Assigned Domain</span>
                      <div className="flex items-center gap-2">
                         <Globe className="w-4 h-4 text-emerald-500" />
                         <span className="text-sm font-semibold text-white">{(formData.name || 'enterprise').toLowerCase().replace(/[^a-z0-9]/g, '_')}.nexuscore.io</span>
                      </div>
                    </div>
                    <div className="h-px bg-white/5" />
                    <div>
                      <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">Access Level</span>
                      <div className="flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full bg-emerald-500" />
                         <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Administrator Access Granted</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="px-10 py-8 bg-slate-950/80 backdrop-blur-md border-t border-slate-800 flex gap-4">
          <button 
            disabled={currentStep === 0 || isInitializing}
            onClick={prevStep}
            className="flex-1 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider hover:text-white transition-colors disabled:opacity-0"
          >
            Previous
          </button>
          <button 
            onClick={() => {
              if (currentStep === 0 && !formData.name) {
                setErrorDetails("Agency Name is required to continue.");
                return;
              }
              nextStep();
            }}
            disabled={isInitializing}
            className={cn(
              "flex-[2] py-4 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50",
              currentStep === steps.length - 1 
                ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_10px_30px_rgba(16,185,129,0.3)]"
                : "bg-white hover:bg-slate-100 text-black shadow-xl"
            )}
          >
            {isInitializing ? (
              <>
                <div className="w-3 h-3 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                Setting up workspace...
              </>
            ) : (
              <>
                {currentStep === steps.length - 1 ? 'Launch Workspace' : 'Continue'}
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      <div className="mt-12 flex items-center gap-4 opacity-30 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-700">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Powered by</span>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 bg-primary rounded flex items-center justify-center text-xs text-white font-bold">N</div>
          <span className="text-xs font-bold text-white uppercase tracking-tight">NexusCore</span>
        </div>
      </div>
    </div>
  );
};
