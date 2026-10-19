import type { MascotMood } from './moodArt';

/**
 * The moments the app shows the mascot in (architecture: "Brend və maskot"). Code names a
 * moment; the design decides the art. A new moment = one line here + one drawing.
 */
export const moments = {
  greeting: 'salam',
  correct: 'sevinc',
  wrong: 'teselli',
  lessonDone: 'bayram',
  unitDone: 'bayram',
  streakBroken: 'darixdim',
  comeback: 'hero',
  loading: 'ucur',
  offline: 'yuxulu',
  aiThinking: 'dusunur',
  aiExplains: 'izah',
  weakSpot: 'kesfiyyat',
  reward: 'teeccub',
  focus: 'fokus',
} as const satisfies Record<string, MascotMood>;

export type MascotMoment = keyof typeof moments;
