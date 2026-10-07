import type { IconName } from '@/components/ui';

const SUBJECT_ICONS: Record<string, IconName> = {
  calculator: 'calculator',
  book: 'book',
  language: 'language',
  magnet: 'magnet',
  flask: 'flask',
  leaf: 'leaf',
  time: 'time',
  earth: 'earth',
};

/** Maps a subject's icon key from content to an icon, with a safe fallback. */
export function subjectIcon(key: string): IconName {
  return SUBJECT_ICONS[key] ?? 'school';
}
