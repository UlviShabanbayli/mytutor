import type { TFunction } from 'i18next';
import type { CurriculumEntry } from '@mytutor/types';

/** "Riyaziyyat · 7-ci sinif", or whichever part is known. */
export function curriculumSubtitle(
  t: TFunction,
  entry: Pick<CurriculumEntry, 'subject' | 'grade'>,
): string {
  return [entry.subject, entry.grade ? t('curricula.grade', { grade: entry.grade }) : null]
    .filter(Boolean)
    .join(' · ');
}
