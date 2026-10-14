import { describe, expect, it } from 'vitest';
import { dollarMath } from './dollarMath';

describe('dollarMath', () => {
  it('splits prose and math between dollar signs', () => {
    expect(dollarMath('Bank $-2\\frac{1}{4}$ nöqtəsində, $|a| = |-a|$.')).toEqual([
      { math: false, text: 'Bank ' },
      { math: true, text: '-2\\frac{1}{4}' },
      { math: false, text: ' nöqtəsində, ' },
      { math: true, text: '|a| = |-a|' },
      { math: false, text: '.' },
    ]);
  });

  it('keeps a lone dollar sign as prose', () => {
    expect(dollarMath('Qiyməti 5 $ idi.')).toEqual([{ math: false, text: 'Qiyməti 5 $ idi.' }]);
  });
});
