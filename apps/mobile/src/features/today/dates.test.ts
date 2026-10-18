import { clock, dayKey, daysBetween, relativeDay } from './dates';

describe('dayKey', () => {
  it('uses the local calendar day with padded parts', () => {
    expect(dayKey(new Date(2026, 9, 8, 23, 59))).toBe('2026-10-08');
    expect(dayKey(new Date(2026, 0, 1, 0, 0))).toBe('2026-01-01');
  });
});

describe('daysBetween', () => {
  it('counts whole days in both directions', () => {
    expect(daysBetween('2026-10-09', '2026-10-18')).toBe(9);
    expect(daysBetween('2026-10-18', '2026-10-17')).toBe(-1);
    expect(daysBetween('2026-10-18', '2026-10-18')).toBe(0);
  });

  it('crosses months and years', () => {
    expect(daysBetween('2026-12-30', '2027-01-02')).toBe(3);
    expect(daysBetween('2026-02-28', '2026-03-01')).toBe(1);
  });
});

describe('relativeDay', () => {
  const now = new Date(2026, 9, 18, 10, 0);

  it('names today, yesterday and tomorrow by calendar day, not by 24 hours', () => {
    expect(relativeDay(new Date(2026, 9, 18, 0, 5), now)).toBe('today');
    expect(relativeDay(new Date(2026, 9, 17, 23, 59), now)).toBe('yesterday');
    expect(relativeDay(new Date(2026, 9, 19, 23, 59), now)).toBe('tomorrow');
    expect(relativeDay(new Date(2026, 9, 15, 12, 0), now)).toBe('other');
  });
});

describe('clock', () => {
  it('pads hours and minutes', () => {
    expect(clock(new Date(2026, 9, 18, 9, 5))).toBe('09:05');
  });
});
