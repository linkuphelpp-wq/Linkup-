import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// استيراد ملفات الترجمة
import arTranslation from '../locales/ar.json';
import enTranslation from '../locales/en.json';

const resources = {
  ar: { translation: arTranslation },
  en: { translation: enTranslation },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ar',
    supportedLngs: ['ar', 'en'],
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'atheer_language',
    },
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

// دوال مساعدة
export const changeLanguage = (lng) => {
  i18n.changeLanguage(lng);
  localStorage.setItem('atheer_language', lng);
  document.documentElement.lang = lng;
  document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
};

export const getCurrentLanguage = () => {
  return localStorage.getItem('atheer_language') || i18n.language || 'ar';
};

export default i18n;