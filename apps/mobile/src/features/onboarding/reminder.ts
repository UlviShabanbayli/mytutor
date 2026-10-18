/** Times the daily reminder can be set to on first launch (the full picker lives in settings). */
export const REMINDER_TIMES = ['16:00', '17:00', '18:00', '19:00', '20:00', '21:00'] as const;
export type ReminderTime = (typeof REMINDER_TIMES)[number];
export const DEFAULT_REMINDER_TIME: ReminderTime = '19:00';

// Vowel harmony of the last word of a number read aloud: units bir, iki, üç, dörd, beş, altı,
// yeddi, səkkiz, doqquz; tens sıfır, on, iyirmi, otuz, qırx, əlli.
const UNIT_ENDING = ['da', 'də', 'də', 'də', 'də', 'də', 'da', 'də', 'də', 'da'] as const;
const TENS_ENDING = ['da', 'da', 'də', 'da', 'da', 'də'] as const;

function numberEnding(n: number): 'da' | 'də' {
  const units = n % 10;
  if (units !== 0) return UNIT_ENDING[units] ?? 'da';
  return TENS_ENDING[Math.floor(n / 10)] ?? 'da';
}

/**
 * The Azerbaijani locative ending after a clock time, as the time is read aloud:
 * "19:00-da" (on doqquz), "20:00-də" (iyirmi), "18:30-da" (otuz).
 */
export function azLocativeEnding(time: string): 'da' | 'də' {
  const [hours = 0, minutes = 0] = time.split(':').map(Number);
  return numberEnding(minutes === 0 ? hours : minutes);
}
