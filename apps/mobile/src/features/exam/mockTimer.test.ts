import { clockParts, formatClock, remainingMs, spentMinutes } from './mockTimer';

describe('mock timer', () => {
  const start = Date.UTC(2026, 9, 24, 7, 0);

  it('counts down from the start time and stops at zero', () => {
    expect(remainingMs(start, 60, start)).toBe(3_600_000);
    expect(remainingMs(start, 60, start + 11 * 60_000 + 48_000)).toBe(48 * 60_000 + 12_000);
    expect(remainingMs(start, 60, start + 2 * 3_600_000)).toBe(0);
  });

  it('rounds seconds up so the clock reads 00:00 only when time is over', () => {
    expect(clockParts(48 * 60_000 + 11_200)).toEqual({ minutes: 48, seconds: 12 });
    expect(formatClock(48 * 60_000 + 12_000)).toBe('48:12');
    expect(formatClock(400)).toBe('00:01');
    expect(formatClock(0)).toBe('00:00');
  });

  it('reports at least one minute spent', () => {
    expect(spentMinutes(start, start + 58 * 60_000 + 10_000)).toBe(58);
    expect(spentMinutes(start, start + 5_000)).toBe(1);
  });
});
