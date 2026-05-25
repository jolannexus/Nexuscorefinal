import React, { useState } from 'react';
import { Palette, Image as ImageIcon, Layout, Save, RotateCcw } from 'lucide-react';
import { Reseller } from '../../types/index';
import { cn } from '../../utils/cn';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';

interface BrandingManagerProps {
  reseller: Reseller;
  onUpdate: (branding: NonNullable<Reseller['branding']>) => void;
  onClose: () => void;
}

export const BrandingManager = ({ reseller, onUpdate, onClose }: BrandingManagerProps) => {
  const [branding, setBranding] = useState(reseller.branding || {
    primaryColor: '#10b981',
    secondaryColor: '#ffffff',
    storeName: reseller.name,
    tagline: 'Your Premium Gaming Store',
    logoUrl: ''
  });

  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    // Simulate API delay
    setTimeout(() => {
      onUpdate(branding);
      setSaving(false);
      onClose();
    }, 1000);
  };

  const colors = [
    { name: 'Emerald', hex: '#10b981' },
    { name: 'Violet', hex: '#8b5cf6' },
    { name: 'Indigo', hex: '#6366f1' },
    { name: 'Rose', hex: '#f43f5e' },
    { name: 'Amber', hex: '#f59e0b' },
    { name: 'Cyan', hex: '#06b6d4' },
    { name: 'White', hex: '#ffffff' },
  ];

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Branding Settings"
      subtitle="Customize your storefront"
      maxWidth="2xl"
      footer={
        <div className="flex gap-4">
          <Button variant="ghost" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            className="flex-[2]" 
            onClick={handleSave} 
            loading={saving}
            icon={<Save className="w-4 h-4" />}
          >
            Save Changes
          </Button>
        </div>
      }
    >
      <div className="space-y-8">
        {/* Store Identity */}
        <div className="space-y-4">
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Layout className="w-3.5 h-3.5" />
            Store Identity
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <span className="text-[11px] text-slate-400 font-medium ml-1">Store Name</span>
              <input 
                type="text"
                value={branding.storeName}
                onChange={(e) => setBranding({...branding, storeName: e.target.value})}
                className="vortex-input font-semibold text-white"
                placeholder="Enter store name..."
              />
            </div>
            <div className="space-y-2">
              <span className="text-[11px] text-slate-400 font-medium ml-1">Tagline</span>
              <input 
                type="text"
                value={branding.tagline}
                onChange={(e) => setBranding({...branding, tagline: e.target.value})}
                className="vortex-input font-medium text-white"
                placeholder="Enter store tagline..."
              />
            </div>
          </div>
        </div>

        {/* Theme Color */}
        <div className="space-y-4">
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Palette className="w-3.5 h-3.5" />
            Brand Theme Colors
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <span className="text-[11px] text-slate-400 font-medium ml-1">Primary Color</span>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                  <button
                    key={`primary-${color.hex}`}
                    onClick={() => setBranding({...branding, primaryColor: color.hex})}
                    className={cn(
                      "group relative w-10 h-10 rounded-xl border-2 transition-all p-1",
                      branding.primaryColor === color.hex ? "border-white" : "border-transparent opacity-60 hover:opacity-100"
                    )}
                  >
                    <div className="w-full h-full rounded-lg shadow-inner" style={{ backgroundColor: color.hex }} />
                  </button>
                ))}
              </div>
            </div>
            
            <div className="space-y-3">
              <span className="text-[11px] text-slate-400 font-medium ml-1">Secondary Color</span>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                  <button
                    key={`secondary-${color.hex}`}
                    onClick={() => setBranding({...branding, secondaryColor: color.hex})}
                    className={cn(
                      "group relative w-10 h-10 rounded-xl border-2 transition-all p-1",
                      branding.secondaryColor === color.hex ? "border-white" : "border-transparent opacity-60 hover:opacity-100"
                    )}
                  >
                    <div className="w-full h-full rounded-lg shadow-inner" style={{ backgroundColor: color.hex }} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Logo URL */}
        <div className="space-y-4">
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <ImageIcon className="w-3.5 h-3.5" />
            Store Logo
          </label>
          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
               <input 
                  type="text"
                  value={branding.logoUrl}
                  onChange={(e) => setBranding({...branding, logoUrl: e.target.value})}
                  className="vortex-input"
                  placeholder="https://example.com/logo.png"
                />
                <p className="text-[10px] text-slate-500  uppercase tracking-wide">Transparent PNG or SVG recommended for optimal node rendering.</p>
            </div>
            <div className="w-14 h-14 bg-[#050505] rounded-xl border border-white/5 flex items-center justify-center overflow-hidden shrink-0 mt-1">
              {branding.logoUrl ? (
                <img src={branding.logoUrl} alt="Preview" className="w-8 h-8 object-contain" />
              ) : (
                <Layout className="w-5 h-5 text-slate-600" />
              )}
            </div>
          </div>
        </div>

        {/* Reset Action */}
        <div className="pt-2">
          <Button 
            variant="ghost"
            size="sm"
            onClick={() => setBranding({
              primaryColor: '#10b981',
              secondaryColor: '#ffffff',
              storeName: reseller.name,
              tagline: 'Your Premium Gaming Store',
              logoUrl: ''
            })}
            icon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Restore Defaults
          </Button>
        </div>
      </div>
    </Modal>
  );
};
