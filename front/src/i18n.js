import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpApi from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './langues/en.json';
import fr from './langues/fr.json';

// Initialize i18next
i18n
  .use(HttpApi)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: en,
      },
      fr: {
        translation: fr,
      },
    },
    supportedLngs: ['en', 'fr'],
    fallbackLng: 'fr',
    debug: true,
    detection: {
      order: ['querystring', 'cookie', 'sessionStorage'],
      caches: ['cookie', 'sessionStorage'],
    },
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
