import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import { DEFAULT_LOCALE, localeSchema } from '@mytutor/schemas';
import type { Locale } from '@mytutor/types';
import { az } from './locales/az';
import { en } from './locales/en';
import { ru } from './locales/ru';

export const resources = {
  az: { translation: az },
  ru: { translation: ru },
  en: { translation: en },
} as const;

/** First supported device language, falling back to Azerbaijani. */
function detectLocale(): Locale {
  for (const { languageCode } of getLocales()) {
    const parsed = localeSchema.safeParse(languageCode);
    if (parsed.success) return parsed.data;
  }
  return DEFAULT_LOCALE;
}

const i18n = createInstance();

void i18n.use(initReactI18next).init({
  resources,
  lng: detectLocale(),
  fallbackLng: DEFAULT_LOCALE,
  interpolation: { escapeValue: false },
});

export default i18n;
