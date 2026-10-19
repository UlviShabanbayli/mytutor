import type { MasteryLevel } from '@/features/learn/types';
import type { ColorName } from '@/theme';

/** Ink on a cell of each level (design: lockInk, onNectar, onHoney, onSealed, crystalInk). */
export const levelInk: Record<MasteryLevel, ColorName> = {
  not_started: 'lock-ink',
  lesson_completed: 'on-nectar',
  mastered: 'on-honey',
  reinforced: 'on-sealed',
  needs_practice: 'crystal-ink',
};

export const levelText: Record<MasteryLevel, string> = {
  not_started: 'text-lock-ink',
  lesson_completed: 'text-on-nectar',
  mastered: 'text-on-honey',
  reinforced: 'text-on-sealed',
  needs_practice: 'text-crystal-ink',
};

/** Flat fill of a level for pills and badges (nectar stands for the half-filled cell). */
export const levelFill: Record<MasteryLevel, ColorName> = {
  not_started: 'wax',
  lesson_completed: 'nectar',
  mastered: 'honey',
  reinforced: 'sealed',
  needs_practice: 'crystal',
};

export const levelBg: Record<MasteryLevel, string> = {
  not_started: 'bg-wax',
  lesson_completed: 'bg-nectar',
  mastered: 'bg-honey',
  reinforced: 'bg-sealed',
  needs_practice: 'bg-crystal',
};
