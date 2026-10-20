import { makeClock } from '@mytutor/demo-data';
import type { When } from './format';

/**
 * The demo world's moments as the "Mən" area words them. The world counts days in Baku time
 * (UTC+4), so these do too: a phone in another time zone shows the same days and times.
 */

const BAKU_OFFSET_MS = 4 * 3_600_000;
const pad = (n: number) => String(n).padStart(2, '0');

/** "18:00": the Baku clock time of a moment. */
export function clockOf(iso: string): string {
  const baku = new Date(Date.parse(iso) + BAKU_OFFSET_MS);
  return `${pad(baku.getUTCHours())}:${pad(baku.getUTCMinutes())}`;
}

/** "2026-10-20": the Baku day of a moment. */
export function dayOf(iso: string): string {
  return new Date(Date.parse(iso) + BAKU_OFFSET_MS).toISOString().slice(0, 10);
}

/** Bu gün / dünən / sabah, or the weekday (Monday = 0), with the time when `withTime`. */
export function whenOf(iso: string, now: Date = new Date(), withTime = true): When {
  const clock = makeClock(now);
  const days = clock.daysUntil(iso);
  const day: When['day'] =
    days === 0
      ? 'today'
      : days === -1
        ? 'yesterday'
        : days === 1
          ? 'tomorrow'
          : (((((clock.weekday + days) % 7) + 7) % 7) as Extract<When['day'], number>);
  return withTime ? { day, time: clockOf(iso) } : { day };
}
