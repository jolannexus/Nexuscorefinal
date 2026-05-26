import React, { useState, useEffect } from 'react';
import { useTenant } from '../contexts/TenantContext';
import { useAuth } from '../contexts/AuthContext';
import { nexusApi } from '../apiService';
import { 
  Palette, 
  Globe, 
  Layout, 
  Save, 
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Zap,
  LayoutGrid
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../utils/cn';

export const BrandingSettings = () => {
  const { tenant } = useTenant();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    primaryColor: '#8b5cf6',
    secondaryColor: '#10b981',
    logoUrl: '',
    siteTitle: ''
  });

  useEffect(() => {
    if (tenant) {
      setFormData({
        name: tenant.name || '',
        domain: tenant.domain || '',
        primaryColor: tenant.theme?.primary || '#8b5cf6',
        secondaryColor: tenant.theme?.secondary || '#10b981',
        logoUrl: tenant.logoUrl || '',
        siteTitle: tenant.siteTitle || ''
      });
    }
  }, [tenant?.id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant?.id) return;
    
    setLoading(true);
    setError(null);
    try {
      await nexusApi.updateBrandingSettings(tenant.id, {
        name: formData.name,
        domain: formData.domain,
        theme: {
          primary: formData.primaryColor,
          secondary: formData.secondaryColor,
          accent: formData.primaryColor,
        },
        logoUrl: formData.logoUrl,
        siteTitle: formData.siteTitle
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update branding');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-bold text-white uppercase tracking-tight">Identity Matrix</h1>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-2 flex items-center gap-2">
            <Palette className="w-3 h-3 text-primary" />
            White-Label Branding & Visual Protocol Config
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Core Identity */}
          <div className="vortex-card p-8 space-y-6">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Layout className="w-4 h-4" />
              Core Identity
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Agency Name</label>
                <input 
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="vortex-input"
                  placeholder="e.g. Nexus Digital"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Custom Domain</label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700" />
                  <input 
                    type="text"
                    value={formData.domain}
                    onChange={(e) => setFormData({...formData, domain: e.target.value})}
                    className="vortex-input pl-12"
                    placeholder="shop.yourdomain.com"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Site Title</label>
                <input 
                  type="text"
                  value={formData.siteTitle}
                  onChange={(e) => setFormData({...formData, siteTitle: e.target.value})}
                  className="vortex-input"
                  placeholder="Nexus Top-Up Store"
                />
              </div>
            </div>
          </div>

          {/* Visual Protocol */}
          <div className="vortex-card p-8 space-y-6">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              Visual Protocol
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Primary Color</label>
                <div className="flex gap-2">
                  <div 
                    className="w-12 h-12 rounded-xl border border-slate-800 shrink-0" 
                    style={{ backgroundColor: formData.primaryColor }} 
                  />
                  <input 
                    type="text"
                    value={formData.primaryColor}
                    onChange={(e) => setFormData({...formData, primaryColor: e.target.value})}
                    className="vortex-input font-mono text-center uppercase"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Secondary Color</label>
                <div className="flex gap-2">
                  <div 
                    className="w-12 h-12 rounded-xl border border-slate-800 shrink-0" 
                    style={{ backgroundColor: formData.secondaryColor }} 
                  />
                  <input 
                    type="text"
                    value={formData.secondaryColor}
                    onChange={(e) => setFormData({...formData, secondaryColor: e.target.value})}
                    className="vortex-input font-mono text-center uppercase"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Brand Asset (LOGO_URL)</label>
              <div className="relative">
                <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700" />
                <input 
                  type="text"
                  value={formData.logoUrl}
                  onChange={(e) => setFormData({...formData, logoUrl: e.target.value})}
                  className="vortex-input pl-12"
                  placeholder="https://imgur.com/logo.png"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-8 bg-slate-950/60 rounded-[32px] border border-slate-800">
          <div className="flex items-center gap-4">
            {error ? (
              <div className="flex items-center gap-2 text-red-500 font-medium text-xs uppercase tracking-wider animate-pulse">
                <AlertCircle className="w-4 h-4" />
                Error saving
              </div>
            ) : saved ? (
              <div className="flex items-center gap-2 text-emerald-500 font-medium text-xs uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" />
                Saved successfully
              </div>
            ) : (
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider leading-relaxed max-w-sm">
                Updating these parameters will affect the global front-facing identity of your Platform. 
                Changes propagate across regional clusters within 60s.
              </p>
            )}
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="vortex-button-primary min-w-[200px] flex items-center justify-center gap-3 py-4"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                Apply Branding
              </>
            )}
          </button>
        </div>
      </form>

      {/* Preview Section */}
      <div className="space-y-6">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Identity Preview</h3>
        <div className="vortex-card p-12 flex items-center justify-center bg-slate-950/40 min-h-[300px]">
          <div className="space-y-8 text-center">
            {formData.logoUrl ? (
              <img src={formData.logoUrl} alt="Logo Preview" className="h-16 mx-auto object-contain" />
            ) : (
              <div 
                className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-slate-950 font-bold text-2xl"
                style={{ backgroundColor: formData.primaryColor }}
              >
                {formData.name.charAt(0) || 'N'}
              </div>
            )}
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-white uppercase tracking-tight" style={{ color: formData.primaryColor }}>
                {formData.siteTitle || formData.name || 'Platform'}
              </h2>
              <div className="flex items-center justify-center gap-4">
                <div className="w-20 h-2 rounded-full overflow-hidden bg-slate-900 border border-slate-800">
                  <div className="h-full w-2/3" style={{ backgroundColor: formData.primaryColor }} />
                </div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">
                  {formData.domain || 'node-01.nexuscore.io'}
                </span>
              </div>
            </div>
            <button 
              className="px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-wider shadow-xl transition-all"
              style={{ backgroundColor: formData.primaryColor, color: '#000' }}
            >
              Initialize Transaction
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
