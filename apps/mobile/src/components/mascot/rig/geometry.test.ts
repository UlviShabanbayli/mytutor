import { ARM_R } from './data/poses';
import { backOut, ease, elasticOut } from './ease';
import { ellipse, propMatrix, quad, rotateAbout } from './geometry';

describe('rig geometry', () => {
  it('draws a quadratic curve and turns it about a pivot', () => {
    expect(quad([30, 118, 14, 124, 12, 138])).toBe('M30 118 Q14 124 12 138');
    expect(quad([40, 0, 0, 0, 0, 0], rotateAbout(90, 0, 0))).toBe('M0 40 Q0 0 0 0');
  });

  it('draws a turned ellipse as two arcs through its far ends', () => {
    expect(ellipse(44, 76, 28, 20, 0)).toBe('M72 76 A28 20 0 1 0 16 76 A28 20 0 1 0 72 76 Z');
  });

  it('leaves a held prop where it was drawn for its own arm pose', () => {
    const m = propMatrix(ARM_R.point, ARM_R.point);
    m.forEach((n, i) => expect(n).toBeCloseTo([1, 0, 0, 1, 0, 0][i] ?? 0));
  });

  it('moves a held prop with the hand', () => {
    const m = propMatrix([170, 110, 186, 104, 208, 104], ARM_R.point);
    expect(m[4]).toBeCloseTo(10);
    expect(m[5]).toBeCloseTo(0);
  });
});

describe('GSAP eases', () => {
  it('start at 0 and end at 1', () => {
    for (const curve of [
      ease.p2io,
      ease.p3out,
      ease.sineIO,
      ease.back22,
      ease.land,
      backOut(),
      elasticOut(),
    ]) {
      expect(curve(0)).toBeCloseTo(0);
      expect(curve(1)).toBeCloseTo(1);
    }
  });

  it('overshoot where GSAP does (back.out, elastic.out)', () => {
    expect(Math.max(...[0.6, 0.7, 0.8].map(ease.back22))).toBeGreaterThan(1);
    expect(Math.max(...[0.1, 0.15, 0.2].map(ease.land))).toBeGreaterThan(1);
  });
});
