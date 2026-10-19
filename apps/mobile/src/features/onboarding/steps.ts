import type { StepKey, StepTrack } from './types';

/** How many steps each track has (design: first launch 5, account 3, teacher 4, parent 3). */
export const TRACK_LENGTH: Record<StepTrack, number> = {
  start: 5,
  account: 3,
  teacher: 4,
  parent: 3,
};

/**
 * Which step of which track a screen is. The exam screen shares the goal's step (it is a
 * branch of it), consent shares the age step; teacher and parent start after their account.
 */
const STEPS: Record<StepKey, { track: StepTrack; step: number }> = {
  lang: { track: 'start', step: 1 },
  role: { track: 'start', step: 2 },
  grade: { track: 'start', step: 3 },
  goal: { track: 'start', step: 4 },
  exam: { track: 'start', step: 4 },
  time: { track: 'start', step: 5 },
  ready: { track: 'start', step: 5 },
  phone: { track: 'account', step: 1 },
  otp: { track: 'account', step: 2 },
  age: { track: 'account', step: 3 },
  consent: { track: 'account', step: 3 },
  teacher: { track: 'teacher', step: 2 },
  parent: { track: 'parent', step: 2 },
};

export type StepPosition = { track: StepTrack; step: number; total: number };

export function stepPosition(key: StepKey): StepPosition {
  const { track, step } = STEPS[key];
  return { track, step, total: TRACK_LENGTH[track] };
}
