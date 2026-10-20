import type { StepTrack } from '@/features/onboarding/types';

/** Where a step screen sits: its track ("start", "account", …) and its 1-based step. */
export type StepPlace = { track: StepTrack; step: number };

/**
 * How a step screen comes in (transitions.onboarding A): `dir` 1 slides its question in from
 * the right (a step forward), -1 from the left (back to it), 0 shows it at once (the first
 * screen of a track). `from` is the step the dashes were showing before, to stretch from.
 */
export type StepEntry = { dir: -1 | 0 | 1; from: number | null };

export function planEntry(
  current: StepPlace | null,
  last: StepPlace | null,
  returning: boolean,
): StepEntry {
  if (!current || !last || last.track !== current.track) return { dir: 0, from: null };
  return { dir: returning ? -1 : 1, from: last.step };
}

/** The step shown last, across the screens of a flow (each step is its own route). */
let lastShown: StepPlace | null = null;

export function lastStep(): StepPlace | null {
  return lastShown;
}

export function rememberStep(place: StepPlace | null): void {
  if (place) lastShown = place;
}
