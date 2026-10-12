import { describe, expect, it } from 'vitest';
import { splitInlineMath } from './inlineMath';

const show = (text: string) => splitInlineMath(text).map((p) => (p.math ? `[${p.text}]` : p.text));

describe('splitInlineMath', () => {
  it('typesets LaTeX written into prose, with the sign or number before it', () => {
    expect(show('Bank -2\\frac{1}{4} nöqtəsində, Məktəb \\frac{1}{2} nöqtəsində.')).toEqual([
      'Bank ',
      '[-2\\frac{1}{4}]',
      ' nöqtəsində, Məktəb ',
      '[\\frac{1}{2}]',
      ' nöqtəsində.',
    ]);
  });

  it('takes a whole label that is LaTeX', () => {
    expect(show('-1\\frac{1}{2}')).toEqual(['[-1\\frac{1}{2}]']);
  });

  it('reads scripts with their base, also a bracketed one', () => {
    expect(show('(7)^2 = (-7)^2 = 49')).toEqual(['[(7)^2]', ' = ', '[(-7)^2]', ' = 49']);
    expect(show('x^{2} + 1')).toEqual(['[x^{2}]', ' + 1']);
  });

  it('keeps commands chained with their arguments and scripts', () => {
    expect(show('a ≥ 0 olduqda \\sqrt{a^{2}} = a')).toEqual([
      'a ≥ 0 olduqda ',
      '[\\sqrt{a^{2}}]',
      ' = a',
    ]);
  });

  it('leaves prose and Unicode mathematics alone', () => {
    expect(show('Bank −2¼ nöqtəsində, x² və √5')).toEqual(['Bank −2¼ nöqtəsində, x² və √5']);
    expect(show('')).toEqual(['']);
  });
});
