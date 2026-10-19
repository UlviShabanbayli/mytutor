import {
  addDays,
  clockTime,
  daysBetween,
  daysUntilIso,
  upcomingWeekday,
  weekdayIndex,
} from './calendar';

// Sunday, 18 October 2026 (the design's "today").
const sunday = new Date(2026, 9, 18, 9, 30);

describe('calendar', () => {
  it('numbers weekdays from Monday', () => {
    expect(weekdayIndex(sunday)).toBe(6);
    expect(weekdayIndex(new Date(2026, 9, 19))).toBe(0);
  });

  it('counts calendar days, ignoring the time of day', () => {
    expect(daysBetween(sunday, new Date(2026, 9, 24, 1))).toBe(6);
    expect(daysBetween(sunday, new Date(2026, 9, 17, 23))).toBe(-1);
    expect(daysBetween(sunday, addDays(sunday, 30))).toBe(30);
  });

  it('finds the next Saturday at least three days ahead', () => {
    const saturday = upcomingWeekday(sunday, 5, 3, 11, 0);
    expect(saturday).toEqual(new Date(2026, 9, 24, 11, 0));
    // On a Thursday the coming Saturday is too close: the one after it is used.
    expect(upcomingWeekday(new Date(2026, 9, 22), 5, 3, 11, 0)).toEqual(new Date(2026, 9, 31, 11));
  });

  it('formats clock times and days until an ISO date', () => {
    expect(clockTime(new Date(2026, 9, 24, 9, 5))).toBe('09:05');
    expect(daysUntilIso('2026-10-28', sunday)).toBe(10);
    expect(daysUntilIso('2026-10-01', sunday)).toBe(0);
    expect(daysUntilIso('soon', sunday)).toBeNull();
  });
});
