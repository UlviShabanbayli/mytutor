import 'i18next';
import type { az } from './locales/az';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: { translation: typeof az };
  }
}
