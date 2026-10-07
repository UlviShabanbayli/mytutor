import { twMerge } from 'tailwind-merge';

/**
 * Joins className fragments, skipping falsy values. Later classes win on conflicts
 * (e.g. a caller's `p-2` overrides a component's default `p-4`).
 * tailwind-merge v2 matches Tailwind CSS v3, which NativeWind v4 uses.
 */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return twMerge(classes.filter(Boolean).join(' '));
}
