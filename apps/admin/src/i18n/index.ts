import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';
import { DEFAULT_LOCALE } from '@mytutor/schemas';
import { az } from './locales/az';

// Azerbaijani-only for now; strings still go through keys so locales can be added later.
export const resources = {
  az: { translation: az },
} as const;

const i18n = createInstance();

void i18n.use(initReactI18next).init({
  resources,
  lng: DEFAULT_LOCALE,
  fallbackLng: DEFAULT_LOCALE,
  interpolation: { escapeValue: false },
});

export default i18n;
