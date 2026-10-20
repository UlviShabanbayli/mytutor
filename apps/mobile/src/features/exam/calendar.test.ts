import { addDays, clockTime, daysBetween, weekdayIndex } from './calendar';

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

  it('formats clock times', () => {
    expect(clockTime(new Date(2026, 9, 24, 9, 5))).toBe('09:05');
  });
});
