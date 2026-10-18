import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';
import { DEFAULT_LOCALE } from '@mytutor/schemas';
import { az } from './locales/az';
import { ru } from './locales/ru';

/**
 * Azerbaijani and the Russian sector. Azerbaijani is the source of truth for keys; Russian
 * falls back to it for anything missing. The student's choice is applied by `LocaleSync`.
 */
export const resources = {
  az: { translation: az },
  ru: { translation: ru },
} as const;

export const APP_LOCALES = ['az', 'ru'] as const;
export type AppLocale = (typeof APP_LOCALES)[number];

const i18n = createInstance();

void i18n.use(initReactI18next).init({
  resources,
  lng: DEFAULT_LOCALE,
  fallbackLng: DEFAULT_LOCALE,
  interpolation: { escapeValue: false },
});

export default i18n;
