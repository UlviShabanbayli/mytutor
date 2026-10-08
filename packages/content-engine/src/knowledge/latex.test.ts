import { describe, expect, it } from 'vitest';
import { checkIdentity, latexSyntaxError, latexToMath } from './latex';

describe('latexToMath', () => {
  it.each([
    ['(a+b)^2', '(a+b)^2'],
    ['2ab', '2*a*b'],
    ['2 \\cdot x \\cdot 3', '2*x*3'],
    ['0{,}2x', '0.2*x'],
    ['5\\frac{1}{3}', '5+((1)/(3))'],
    ['\\left(\\frac{1}{2}a-1\\right)^{2}', '(((1)/(2))*a-1)^(2)'],
    ['\\underbrace{2x}_{a}', '(2*x)'],
  ])('%s → %s', (latex, expected) => {
    expect(latexToMath(latex)).toBe(expected);
  });

  it('gives up on constructs it does not know', () => {
    expect(latexToMath('\\int x\\,dx')).toBeNull();
  });
});

describe('checkIdentity', () => {
  it('accepts the textbook identities', () => {
    expect(checkIdentity('(a+b)^2 = a^2 + 2ab + b^2')?.holds).toBe(true);
    expect(
      checkIdentity('(a-b)^2 = (a-b)(a-b) = a^2 - ab - ab + b^2 = a^2 - 2ab + b^2')?.holds,
    ).toBe(true);
    expect(checkIdentity('a^2 \\pm 2ab + b^2 = (a \\pm b)^2')?.holds).toBe(true);
    expect(
      checkIdentity('(2x-3)^2 = (2x)^2 - 2 \\cdot 2x \\cdot 3 + 3^2 = 4x^2 - 12x + 9')?.holds,
    ).toBe(true);
  });

  it('catches a misread formula', () => {
    expect(checkIdentity('(a+b)^2 = a^2 + ab + b^2')).toEqual({
      holds: false,
      detail: '"(a+b)^2" ≠ "a^2 + ab + b^2"',
    });
  });

  it('skips expressions that are not equalities', () => {
    expect(checkIdentity('(x+3)^2')).toBeNull();
  });
});

describe('latexSyntaxError', () => {
  it('reports malformed LaTeX', () => {
    expect(latexSyntaxError('(a+b)^{2')).not.toBeNull();
    expect(latexSyntaxError('\\frac{1}{2}')).toBeNull();
  });
});
