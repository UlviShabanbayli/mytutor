import { codeCells, formatCode, formatMinSec, normalizeCode, secondsLeft } from './codes';

describe('codes', () => {
  it('keeps capitals and digits only, at most six', () => {
    expect(normalizeCode('r4t-9kb')).toBe('R4T9KB');
    expect(normalizeCode(' R4T 9KB 77 ')).toBe('R4T9KB');
    expect(normalizeCode('ə!')).toBe('');
  });

  it('fills six boxes, empty ones as empty strings', () => {
    expect(codeCells('R4T')).toEqual(['R', '4', 'T', '', '', '']);
  });

  it('groups a code by three', () => {
    expect(formatCode('K7Q42M')).toBe('K7Q 42M');
  });

  it('counts down whole seconds and formats them', () => {
    expect(secondsLeft(10_000, 0)).toBe(10);
    expect(secondsLeft(10_000, 9_500)).toBe(1);
    expect(secondsLeft(10_000, 12_000)).toBe(0);
    expect(formatMinSec(581)).toBe('9:41');
    expect(formatMinSec(600)).toBe('10:00');
    expect(formatMinSec(5)).toBe('0:05');
  });
});
