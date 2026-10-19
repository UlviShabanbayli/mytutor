import { formatCountdown, secondsUntil } from './countdown';

describe('formatCountdown', () => {
  it.each([
    [0, '0:00'],
    [42, '0:42'],
    [60, '1:00'],
    [75, '1:15'],
    [-3, '0:00'],
  ])('%i -> %s', (seconds, text) => {
    expect(formatCountdown(seconds)).toBe(text);
  });
});

describe('secondsUntil', () => {
  it('rounds partial seconds up and never goes below zero', () => {
    expect(secondsUntil(10_500, 0)).toBe(11);
    expect(secondsUntil(1000, 5000)).toBe(0);
    expect(secondsUntil(null, 0)).toBe(0);
  });
});
