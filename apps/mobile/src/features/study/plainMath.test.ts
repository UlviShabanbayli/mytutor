import { plainFormula, plainMath } from './plainMath';

describe('plainMath', () => {
  it('writes powers, indices and signs as printed', () => {
    expect(plainFormula('(a+b)^{3} = a^3 + 3a^{2}b')).toBe('(a+b)³ = a³ + 3a²b');
    expect(plainFormula('x_{1} - x_2')).toBe('x₁ − x₂');
    expect(plainFormula('2 \\cdot 3 \\le 7')).toBe('2 · 3 ≤ 7');
    expect(plainFormula('90^\\circ')).toBe('90°');
  });

  it('writes fractions with a slash and keeps decimal commas', () => {
    expect(plainFormula('\\frac{1}{2}')).toBe('1/2');
    expect(plainFormula('\\frac{a+1}{b}')).toBe('(a+1)/b');
    expect(plainFormula('0{,}5')).toBe('0,5');
    expect(plainFormula('\\sqrt{16}')).toBe('√16');
  });

  it('falls back to a caret for a power with no superscript form', () => {
    expect(plainFormula('2^{n+1}')).toBe('2ⁿ⁺¹');
    expect(plainFormula('2^{\\alpha}')).toBe('2^(α)');
  });

  it('rewrites only the formulas of a paragraph', () => {
    expect(plainMath('Qüvvət $a^{n}$ belə oxunur: a-nın n-ci dərəcəsi.')).toBe(
      'Qüvvət aⁿ belə oxunur: a-nın n-ci dərəcəsi.',
    );
  });
});
