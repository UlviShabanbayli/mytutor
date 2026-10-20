import {
  classCodeCells,
  formatClassCode,
  formatCode,
  formatMinSec,
  makeParentCode,
  normalizeClassCode,
  secondsLeft,
} from './codes';

describe('codes', () => {
  it('keeps capitals and digits only, at most nine', () => {
    expect(normalizeClassCode('7b-math-4k2')).toBe('7BMATH4K2');
    expect(normalizeClassCode(' 7B MATH 4K2 77 ')).toBe('7BMATH4K2');
    expect(normalizeClassCode('ə!')).toBe('');
  });

  it('fills the boxes by group, empty ones as empty strings', () => {
    expect(classCodeCells('7BMA')).toEqual([
      ['7', 'B'],
      ['M', 'A', '', ''],
      ['', '', ''],
    ]);
  });

  it('writes a class code as the teacher shares it', () => {
    expect(formatClassCode('7BMATH4K2')).toBe('7B-MATH-4K2');
    expect(formatClassCode('7BMA')).toBe('7B-MA');
  });

  it('groups a parent code by three and makes one without look-alike letters', () => {
    expect(formatCode('K7Q42M')).toBe('K7Q 42M');
    expect(makeParentCode(() => 0)).toBe('AAAAAA');
    expect(makeParentCode(() => 0.999)).toMatch(/^[A-Z2-9]{6}$/);
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
