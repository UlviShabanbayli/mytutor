import type { Role } from '@mytutor/types';
import type { AgeGroup } from './types';

/** The age picker's range; the last value stands for "18 or older". */
export const MIN_AGE = 7;
export const MAX_AGE = 18;
export const AGES: readonly number[] = Array.from(
  { length: MAX_AGE - MIN_AGE + 1 },
  (_, i) => MIN_AGE + i,
);

/** Below this age the account opens only with a parent's approval. */
export const CONSENT_AGE = 13;

export function ageGroupOf(age: number): AgeGroup {
  if (age < CONSENT_AGE) return 'under_13';
  return age < MAX_AGE ? 'teen' : 'adult';
}

/**
 * Where the picker starts: a student's usual age for their grade (grade 7 -> 12), an adult for
 * teachers and parents. Only a starting point; the student picks the real one.
 */
export function initialAge(role: Role | null, grade: number | null): number {
  if (role === 'teacher' || role === 'parent') return MAX_AGE;
  if (grade === null) return 12;
  return Math.min(MAX_AGE, Math.max(MIN_AGE, grade + 5));
}

/**
 * The rows the picker shows: `size` slots with `selected` in the middle; slots beyond the range
 * are null so the selection stays centred at both ends.
 */
export function ageWindow(selected: number, size = 5): (number | null)[] {
  const half = Math.floor(size / 2);
  return Array.from({ length: size }, (_, i) => {
    const age = selected - half + i;
    return age >= MIN_AGE && age <= MAX_AGE ? age : null;
  });
}
