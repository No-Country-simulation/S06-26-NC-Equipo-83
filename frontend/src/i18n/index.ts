import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import common_es from './locales/es/common.json';
import landing_es from './locales/es/landing.json';
import auth_es from './locales/es/auth.json';
import app_es from './locales/es/app.json';

import common_pt from './locales/pt/common.json';
import landing_pt from './locales/pt/landing.json';
import auth_pt from './locales/pt/auth.json';
import app_pt from './locales/pt/app.json';

const savedLang = localStorage.getItem('appLanguage') || 'es';

i18n.use(initReactI18next).init({
  resources: {
    es: { common: common_es, landing: landing_es, auth: auth_es, app: app_es },
    pt: { common: common_pt, landing: landing_pt, auth: auth_pt, app: app_pt },
  },
  lng: savedLang,
  fallbackLng: 'es',
  interpolation: { escapeValue: false },
  defaultNS: 'common',
});

export default i18n;
