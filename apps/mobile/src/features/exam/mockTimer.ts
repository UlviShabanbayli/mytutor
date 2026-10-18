/**
 * The mock timer counts from the moment the student pressed "Başla", so leaving the app or
 * closing the screen never stops it (architecture Ş7: later it reads the server's clock).
 */

const MINUTE = 60_000;

export function remainingMs(startedAt: number, durationMinutes: number, now: number): number {
  return Math.max(0, startedAt + durationMinutes * MINUTE - now);
}

/** Whole minutes and seconds left, rounding the seconds up so 0:00 means time is over. */
export function clockParts(ms: number): { minutes: number; seconds: number } {
  const total = Math.ceil(Math.max(0, ms) / 1000);
  return { minutes: Math.floor(total / 60), seconds: total % 60 };
}

/** "48:12" */
export function formatClock(ms: number): string {
  const { minutes, seconds } = clockParts(ms);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/** Minutes spent on a finished mock, at least one. */
export function spentMinutes(startedAt: number, finishedAt: number): number {
  return Math.max(1, Math.round((finishedAt - startedAt) / MINUTE));
}
