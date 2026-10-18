import {
  clockTime,
  dayOffset,
  dueAtOffset,
  dueStatus,
  elapsedClock,
  hoursUntil,
  minutesSince,
} from './time';

// Saturday, 18 October 2026, 14:00 local time.
const now = new Date(2026, 9, 18, 14, 0);

describe('dueStatus', () => {
  it('reads past, today, tomorrow and later', () => {
    expect(dueStatus(new Date(2026, 9, 15, 23, 59), now)).toBe('past');
    expect(dueStatus(new Date(2026, 9, 18, 23, 59), now)).toBe('today');
    expect(dueStatus(new Date(2026, 9, 19, 23, 59), now)).toBe('tomorrow');
    expect(dueStatus(new Date(2026, 9, 22, 23, 59), now)).toBe('later');
  });

  it('counts an earlier hour today as past', () => {
    expect(dueStatus(new Date(2026, 9, 18, 9, 0), now)).toBe('past');
  });
});

describe('day and minute counts', () => {
  it('counts calendar days, not 24-hour spans', () => {
    expect(dayOffset(new Date(2026, 9, 19, 0, 5), now)).toBe(1);
    expect(dayOffset(new Date(2026, 9, 17, 23, 0), now)).toBe(-1);
  });

  it('counts minutes waited and hours left, never below zero', () => {
    expect(minutesSince(new Date(2026, 9, 18, 13, 42), now)).toBe(18);
    expect(minutesSince(new Date(2026, 9, 18, 15, 0), now)).toBe(0);
    expect(hoursUntil(new Date(2026, 9, 18, 16, 0), now)).toBe(2);
  });
});

describe('clocks', () => {
  it('formats a time of day and an elapsed time', () => {
    expect(clockTime(new Date(2026, 9, 18, 9, 5))).toBe('09:05');
    expect(elapsedClock(18 * 60 + 42)).toBe('18:42');
    expect(elapsedClock(3725)).toBe('1:02:05');
  });
});

describe('dueAtOffset', () => {
  it('ends the chosen day at 23:59', () => {
    const due = dueAtOffset(1, now);
    expect([due.getDate(), due.getHours(), due.getMinutes()]).toEqual([19, 23, 59]);
  });
});
