import { describe, expect, it } from 'vitest';
import { formulasIn, mathSvg } from './mathSvg';

describe('mathSvg', () => {
  it('typesets a formula as one bare SVG, sized in em', async () => {
    const out = await mathSvg('n^{2}-1');
    expect(out).not.toBeNull();
    expect(out?.svg).not.toContain('mjx-break');
    expect(out?.svg).not.toMatch(/data-|width="[\d.]+ex"|style=/);
    expect(out?.width).toBeGreaterThan(2);
    // An overline is drawn by an inner SVG of the same formula.
    expect(await mathSvg('\\overline{ab}+\\overline{ba}')).not.toBeNull();
    // A fraction bar keeps its size.
    expect((await mathSvg('\\frac{3}{4}'))?.svg).toMatch(/<rect[^>]*width=/);
  });

  it('refuses what MathJax cannot read', async () => {
    expect(await mathSvg('\\frac{3}{')).toBeNull();
    expect(await mathSvg('\\nosuchcommand{x}')).toBeNull();
  });

  it('finds the formulas of a text', () => {
    expect(formulasIn('$a$ və $b^{2}$, 3 ədəd')).toEqual(['a', 'b^{2}']);
  });
});
