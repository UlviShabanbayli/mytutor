import { placementWave, placementResult as p } from './hiveMotion';

const units = [
  { id: 'u1', topics: [{ id: 'a' }, { id: 'b' }, { id: 'c' }] },
  { id: 'u2', topics: [{ id: 'd' }, { id: 'e' }] },
];

describe('placementWave', () => {
  it('fills known cells along the diagonal (row + column)', () => {
    const wave = placementWave(units, ['a', 'b', 'd'], null);
    expect(wave.cellAt).toEqual({ a: p.start, b: p.start + p.step, d: p.start + p.step });
    expect(wave.cellAt.c).toBeUndefined();
  });

  it('ticks each unit when its cells land', () => {
    const wave = placementWave(units, ['a', 'b', 'd'], null);
    expect(wave.landAt).toEqual({
      u1: [p.start + p.land, p.start + p.step + p.land],
      u2: [p.start + p.step + p.land],
    });
  });

  it('fills the start cell with nectar after its neighbours, without ticking', () => {
    const wave = placementWave(units, ['d'], 'e');
    expect(wave.cellAt.e).toBe(p.start + 2 * p.step + p.startExtra);
    expect(wave.landAt.u2).toEqual([p.start + p.step + p.land]);
  });

  it('ends after the last cell', () => {
    expect(placementWave(units, ['a', 'e'], null).end).toBe(p.start + 2 * p.step + p.after);
    expect(placementWave(units, [], null).end).toBe(p.start + p.after);
  });
});
