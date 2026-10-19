import { busyCellFrame } from './busyCellFrame';
import { knobShape } from './knobShape';

describe('knobShape (buttons.switch B)', () => {
  it('rests round at both ends', () => {
    expect(knobShape(0, 20, 24, false)).toEqual({ translateX: 0, scaleX: 1, scaleY: 1 });
    expect(knobShape(20, 20, 24, true)).toEqual({ translateX: 20, scaleX: 1, scaleY: 1 });
  });

  it('stretches by a quarter half-way and keeps its leading edge in place', () => {
    const on = knobShape(10, 20, 24, true);
    expect(on.scaleX).toBeCloseTo(1.25);
    expect(on.scaleY).toBe(1);
    // Turning on, the right edge (centre + half width) stays where an unscaled knob has it.
    expect(on.translateX + (24 * on.scaleX) / 2).toBeCloseTo(10 + 12);

    const off = knobShape(10, 20, 24, false);
    expect(off.translateX - (24 * off.scaleX) / 2).toBeCloseTo(10 - 12);
  });

  it('squashes against the end instead of overshooting', () => {
    const past = knobShape(23, 20, 24, true);
    expect(past.scaleX).toBeLessThan(1);
    expect(past.scaleY).toBeGreaterThan(1);
    // Its right edge stays at the end of the track (20 + 24) while it squashes.
    expect(past.translateX + 12 + 12 * past.scaleX).toBeCloseTo(44);
  });
});

describe('busyCellFrame (buttons.loading C)', () => {
  it('fills during the first quarter of the loop', () => {
    expect(busyCellFrame(0)).toEqual({ fill: 0, opacity: 1 });
    expect(busyCellFrame(0.125).fill).toBeGreaterThan(0.5);
    expect(busyCellFrame(0.25)).toEqual({ fill: 1, opacity: 1 });
  });

  it('holds full, then fades out at the end', () => {
    expect(busyCellFrame(0.5)).toEqual({ fill: 1, opacity: 1 });
    expect(busyCellFrame(0.9).opacity).toBeLessThan(0.5);
    expect(busyCellFrame(0.9999).opacity).toBeCloseTo(0, 3);
  });

  it('repeats every whole loop', () => {
    expect(busyCellFrame(2.125)).toEqual(busyCellFrame(0.125));
  });
});
