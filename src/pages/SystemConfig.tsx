import React from 'react';
import { Link } from 'react-router-dom';
import { AnnouncementManager } from '../modules/System/AnnouncementManager';
import { LedgerReconciliationManager } from '../modules/System/LedgerReconciliationManager';
import { LedgerDriftMonitor } from '../modules/System/LedgerDriftMonitor';
import { SaaSModelManager } from '../modules/System/SaaSModelManager';
import { Settings, ShieldCheck, Database, Key, Terminal } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { useTranslation } from 'react-i18next';

export const SystemConfigPage = () => {
  const { t } = useTranslation();

  return (
    <div className="max-w-7xl mx-auto py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-white tracking-tight">{t('settings.title')}</h1>
          <p className="text-[13px] text-slate-500 font-medium mt-2">
            {t('settings.subtitle')}
          </p>
        </div>
        <div>
          <Link
            to="/operations"
            className="px-5 py-3 bg-[#e11d48] hover:bg-[#be123c] text-white border border-[#be123c] rounded-xl flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-widest transition-all select-none"
          >
            <Terminal className="w-4 h-4" />
            {t('settings.launchOps')}
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Announcements & Ledgers */}
        <div className="lg:col-span-2 space-y-8">
          <AnnouncementManager />
          
          <LedgerReconciliationManager />

          <LedgerDriftMonitor />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <Card>
                <div className="flex justify-between items-start mb-6">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <Key className="w-5 h-5 text-white" />
                  </div>
                </div>
                <h3 className="text-[12px] font-semibold text-white uppercase tracking-widest mb-2">{t('settings.apiKeysTitle')}</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed font-medium mb-4">
                  {t('settings.apiKeysDesc')}
                </p>
                <button className="text-[11px] text-white font-semibold uppercase tracking-widest hover:text-slate-300 transition-colors pt-1">
                  {t('settings.manageKeys')} &rarr;
                </button>
             </Card>

             <Card>
                <div className="flex justify-between items-start mb-6">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-white" />
                  </div>
                </div>
                <h3 className="text-[12px] font-semibold text-white uppercase tracking-widest mb-2">{t('settings.authTitle')}</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed font-medium mb-4">
                  {t('settings.authDesc')}
                </p>
                <button className="text-[11px] text-white font-semibold uppercase tracking-widest hover:text-slate-300 transition-colors pt-1">
                  {t('settings.manageSecurity')} &rarr;
                </button>
             </Card>
          </div>
        </div>
        
        {/* Right Column: Operation Mode & Misc */}
        <div className="lg:col-span-1 space-y-8">
          <SaaSModelManager />
        </div>
      </div>
    </div>
  );
};
