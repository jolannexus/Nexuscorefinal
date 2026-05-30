import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export function LanguageSelector() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex items-center gap-2 text-sm text-slate-300">
      <Globe className="w-4 h-4 text-emerald-500" />
      <select 
        value={(i18n.language || 'id').startsWith('id') ? 'id' : 'en'}
        onChange={(e) => changeLanguage(e.target.value)}
        className="bg-transparent border-none outline-none cursor-pointer hover:text-white transition-colors"
      >
        <option value="id" className="bg-slate-900 text-slate-100">ID</option>
        <option value="en" className="bg-slate-900 text-slate-100">EN</option>
      </select>
    </div>
  );
}
