/**
 * The demo's one clock. Every date is relative to `now` and counted in Baku time (UTC+4, no
 * daylight saving), so the API, the Worker and a phone in any time zone build the same world.
 */

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const BAKU_OFFSET = 4 * HOUR;

export type Clock = {
  /** `now` as ISO. */
  now: string;
  nowMs: number;
  /** `days` from today (negative = past) at the given Baku time. */
  at: (days: number, hours?: number, minutes?: number) => string;
  /** A moment `minutes` before now. */
  ago: (minutes: number) => string;
  /** A moment `minutes` after now. */
  later: (minutes: number) => string;
  /** Today's weekday in Baku, Monday = 0. */
  weekday: number;
  /** Whole Baku days from today to the moment (negative = past). */
  daysUntil: (iso: string) => number;
};

export function makeClock(now: Date): Clock {
  const nowMs = now.getTime();
  const dayIndex = Math.floor((nowMs + BAKU_OFFSET) / DAY);
  const todayStart = dayIndex * DAY - BAKU_OFFSET;
  const iso = (ms: number) => new Date(ms).toISOString();
  return {
    now: iso(nowMs),
    nowMs,
    at: (days, hours = 0, minutes = 0) =>
      iso(todayStart + days * DAY + hours * HOUR + minutes * MINUTE),
    ago: (minutes) => iso(nowMs - minutes * MINUTE),
    later: (minutes) => iso(nowMs + minutes * MINUTE),
    // 1970-01-01 was a Thursday (Monday = 0 → 3).
    weekday: (dayIndex + 3) % 7,
    daysUntil: (value) => Math.floor((Date.parse(value) + BAKU_OFFSET) / DAY) - dayIndex,
  };
}
