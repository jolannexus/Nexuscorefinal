import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import id from './locales/id.json';
import en from './locales/en.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      id: { translation: id },
      en: { translation: en }
    },
    fallbackLng: 'id',
    lng: localStorage.getItem('i18nextLng') || 'id',
    interpolation: {
      escapeValue: false // React already escapes by default
    }
  });

export default i18n;
