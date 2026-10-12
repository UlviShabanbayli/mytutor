import type { TFunction } from 'i18next';
import type { CurriculumEntry } from '@mytutor/types';

// Azerbaijani ordinals take vowel-harmony suffixes (3-cü, 6-cı, 9-cu), so each grade has a key.
const GRADE_KEYS = [
  'curricula.grades.g1',
  'curricula.grades.g2',
  'curricula.grades.g3',
  'curricula.grades.g4',
  'curricula.grades.g5',
  'curricula.grades.g6',
  'curricula.grades.g7',
  'curricula.grades.g8',
  'curricula.grades.g9',
  'curricula.grades.g10',
  'curricula.grades.g11',
] as const;

export const GRADES = GRADE_KEYS.map((_, i) => i + 1);

/** "7-ci sinif". */
export function gradeLabel(t: TFunction, grade: number): string {
  const key = GRADE_KEYS[grade - 1];
  return key ? t(key) : String(grade);
}

/** "Riyaziyyat · 7-ci sinif", or whichever part is known. */
export function curriculumSubtitle(
  t: TFunction,
  entry: Pick<CurriculumEntry, 'subject' | 'grade'>,
): string {
  return [entry.subject, entry.grade ? gradeLabel(t, entry.grade) : null]
    .filter(Boolean)
    .join(' · ');
}
