import type { TFunction } from 'i18next';
import type { StandardSetEntry } from '@mytutor/types';
import { gradeLabel } from '@/lib/grades';

/** "Riyaziyyat · 7-ci sinif", or whichever part is known. */
export function standardSetSubtitle(
  t: TFunction,
  entry: Pick<StandardSetEntry, 'subject' | 'grade'>,
): string {
  return [entry.subject, entry.grade ? gradeLabel(t, entry.grade) : null]
    .filter(Boolean)
    .join(' · ');
}
