import type { TFunction } from 'i18next';

// Azerbaijani ordinals take vowel-harmony suffixes (3-cü, 6-cı, 9-cu), so each grade has a key.
const GRADE_KEYS = [
  'grades.g1',
  'grades.g2',
  'grades.g3',
  'grades.g4',
  'grades.g5',
  'grades.g6',
  'grades.g7',
  'grades.g8',
  'grades.g9',
  'grades.g10',
  'grades.g11',
] as const;

export const GRADES = GRADE_KEYS.map((_, i) => i + 1);

/** "7-ci sinif". */
export function gradeLabel(t: TFunction, grade: number): string {
  const key = GRADE_KEYS[grade - 1];
  return key ? t(key) : String(grade);
}

/** "Riyaziyyat · 7-ci sinif", or whichever part is known. */
export function subjectAndGrade(
  t: TFunction,
  { subject, grade }: { subject: string; grade: number | null },
): string {
  return [subject, grade ? gradeLabel(t, grade) : null].filter(Boolean).join(' · ');
}
