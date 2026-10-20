import { rubberBand, scrimOpacity, shouldDismiss } from './sheetDrag';

describe('sheet drag', () => {
  it('closes past 35% of the height or on a fast downward flick', () => {
    expect(shouldDismiss(140, 400, 0)).toBe(false);
    expect(shouldDismiss(141, 400, 0)).toBe(true);
    expect(shouldDismiss(20, 400, 900)).toBe(true);
    // A flick upwards never closes it.
    expect(shouldDismiss(20, 400, -900)).toBe(false);
  });

  it('follows the finger down and resists upwards', () => {
    expect(rubberBand(120)).toBe(120);
    expect(rubberBand(-100)).toBeGreaterThan(-100);
    expect(rubberBand(-100)).toBeLessThan(0);
  });

  it('fades the scrim as the sheet goes down', () => {
    expect(scrimOpacity(0, 400)).toBe(1);
    expect(scrimOpacity(200, 400)).toBe(0.5);
    expect(scrimOpacity(500, 400)).toBe(0);
    expect(scrimOpacity(-10, 400)).toBe(1);
    expect(scrimOpacity(10, 0)).toBe(0);
  });
});
