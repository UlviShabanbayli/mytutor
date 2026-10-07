import { z } from 'zod';

export const LOCALES = ['az', 'ru', 'en'] as const;
export const DEFAULT_LOCALE = 'az' satisfies (typeof LOCALES)[number];

export const localeSchema = z.enum(LOCALES);
