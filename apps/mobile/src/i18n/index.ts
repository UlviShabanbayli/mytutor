import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';
import { DEFAULT_LOCALE } from '@mytutor/schemas';
import { az } from './locales/az';

// The app is Azerbaijani-only for now. Strings still go through i18n keys so more
// languages can be added later by dropping in a locale file with the same shape.
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
