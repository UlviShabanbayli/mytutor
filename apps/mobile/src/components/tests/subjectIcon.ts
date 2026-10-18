import type { IconName } from '@/components/ui';

// The arı icon set has no subject pictograms; subject tiles get monogram cells in the design.
const SUBJECT_ICONS: Record<string, IconName> = {
  calculator: 'grid',
  book: 'book',
  language: 'globe',
  magnet: 'bolt',
  flask: 'star',
  leaf: 'star',
  time: 'clock',
  earth: 'globe',
};

/** Maps a subject's icon key from content to an icon, with a safe fallback. */
export function subjectIcon(key: string): IconName {
  return SUBJECT_ICONS[key] ?? 'book';
}
