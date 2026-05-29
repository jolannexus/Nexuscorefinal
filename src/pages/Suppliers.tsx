import React from 'react';
import { SupplierModule } from '../modules/suppliers/SupplierModule';
import { useTranslation } from 'react-i18next';

export const Suppliers = () => {
  const { t } = useTranslation();

  return (
    <div className="max-w-7xl mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">{t('suppliers.title')}</h1>
        <p className="text-sm text-slate-500 font-medium mt-1 flex items-center gap-2">
          {t('suppliers.subtitle')}
        </p>
      </div>

      <SupplierModule />

      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">{t('suppliers.secure')}</h4>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            {t('suppliers.secureDesc')}
          </p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">{t('suppliers.autoUpdates')}</h4>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            {t('suppliers.autoUpdatesDesc')}
          </p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">{t('suppliers.reliability')}</h4>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            {t('suppliers.reliabilityDesc')}
          </p>
        </div>
      </div>
    </div>
  );
};

