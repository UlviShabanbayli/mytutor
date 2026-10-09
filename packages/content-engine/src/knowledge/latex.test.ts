import { describe, expect, it } from 'vitest';
import { checkIdentity, latexSyntaxError, latexToMath, solutionsOf } from './latex';

describe('latexToMath', () => {
  it.each([
    ['(a+b)^2', '(a+b)^2'],
    ['2ab', '2*a*b'],
    ['2 \\cdot x \\cdot 3', '2*x*3'],
    ['0{,}2x', '0.2*x'],
    ['5\\frac{1}{3}', '(5+((1)/(3)))'],
    ['2\\frac{x}{3}', '2*((x)/(3))'],
    ['1440 \\text{ (man)}', '1440'],
    ['\\left(\\frac{1}{2}a-1\\right)^{2}', '(((1)/(2))*a-1)^(2)'],
    ['\\underbrace{2x}_{a}', '(2*x)'],
  ])('%s → %s', (latex, expected) => {
    expect(latexToMath(latex)).toBe(expected);
  });

  it('gives up on constructs it does not know', () => {
    expect(latexToMath('\\int x\\,dx')).toBeNull();
    expect(latexToMath('a \\rightarrow b')).toBeNull();
  });

  it('skips geometry names written with capital letters', () => {
    expect(latexToMath('AM + MB')).toBeNull();
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

describe('checkIdentity: textbook notations', () => {
  it.each([
    ['\\frac{11}{90} = 0{,}1(2)'],
    ['-\\frac{2}{9} = -0{,}(2)'],
    ['5{,}1(32) = 5\\frac{132-1}{990}'],
    ['\\frac{1}{4} + \\frac{-5}{3} = -1\\frac{5}{12}'],
    ['\\left(-1\\frac{1}{3}\\right)^{2} = \\left(\\frac{-4}{3}\\right)^{2}'],
    ['1000 \\cdot 1{,}2 \\cdot 1{,}2 = 1440 \\text{ (man)}'],
  ])('%s holds', (latex) => {
    expect(checkIdentity(latex)?.holds).toBe(true);
  });

  it('still catches a wrong sign', () => {
    expect(checkIdentity('\\frac{-20}{28} = -\\frac{4\\cdot(-5)}{4\\cdot 7}')?.holds).toBe(false);
  });

  it('checks equations with the solution the example reaches', () => {
    expect(checkIdentity('x = \\frac{x + 8}{2}', { x: 8 })?.holds).toBe(true);
    expect(checkIdentity('x = \\frac{x + 8}{2}', { x: 9 })?.holds).toBe(false);
    expect(checkIdentity('x = 2 \\cdot 2 = 4,\\ CG = 4', { x: 4 })?.holds).toBe(true);
  });
});

describe('solutionsOf', () => {
  it('reads values the steps settle on', () => {
    expect(solutionsOf(['x = 8', 'y = 2 \\cdot 2 = 4,\\ CG = 4', 'BC = 7', 'z = a + 1'])).toEqual({
      x: 8,
      y: 4,
    });
  });
});
