import { BAR_HEIGHT, COLLAPSED_SCALE, dockShift } from './collapse';

describe('dockShift', () => {
  it('centres the shrunk title in the bar', () => {
    const shift = dockShift(32, 34, COLLAPSED_SCALE);
    const top = 32 + shift;
    expect(top + (34 * COLLAPSED_SCALE) / 2).toBeCloseTo(BAR_HEIGHT / 2);
  });

  it('centres an unscaled 48pt button too', () => {
    expect(dockShift(18, 48, 1)).toBe(-14);
  });
});
