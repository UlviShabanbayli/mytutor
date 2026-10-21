import { describe, expect, it } from 'vitest';
import { gradeOrdinal, gradeSymbolProblems } from './gradeSymbols';

describe('gradeSymbolProblems', () => {
  it('passes what the grade already uses', () => {
    expect(gradeSymbolProblems(['\\frac{1}{2} \\cdot x', 'A \\subset B', '2\\pi r'], 7)).toEqual(
      [],
    );
    expect(gradeSymbolProblems(['\\sqrt{x^2}', '\\sin\\alpha'], 8)).toEqual([]);
  });

  it('flags notation from later grades, once per command', () => {
    expect(gradeSymbolProblems(['\\sqrt{2} + \\sqrt{3}', '\\log_2 8'], 7)).toEqual([
      '\\sqrt 8-ci sinifdən başlayır',
      '\\log 10-cu sinifdən başlayır',
    ]);
    expect(gradeSymbolProblems(['\\int_0^1 x\\,dx'], 10)).toEqual([
      '\\int 11-ci sinifdən başlayır',
    ]);
  });

  it('always flags commands no school book uses', () => {
    expect(gradeSymbolProblems(['\\aleph_0', '\\partial f'], 11)).toEqual([
      '\\aleph məktəb riyaziyyatında işlənmir',
      '\\partial məktəb riyaziyyatında işlənmir',
    ]);
  });

  it('writes the Azerbaijani ordinal', () => {
    expect([6, 7, 9, 10, 11].map(gradeOrdinal)).toEqual(['6-cı', '7-ci', '9-cu', '10-cu', '11-ci']);
  });
});
