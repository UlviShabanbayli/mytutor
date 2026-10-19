import { ease } from './ease';
import { planTrack, type Segment } from './planTrack';

const seg = (at: number, to: number, dur: number, order = 0): Segment => ({
  at,
  to,
  dur,
  ease: ease.none,
  order,
});

describe('planTrack', () => {
  it('waits before a tween and chains tweens back to back', () => {
    const steps = planTrack([seg(0.3, 1, 0.5), seg(1, 0, 0.2, 1)]);
    expect(steps.map((s) => [s.delay, s.to, s.duration])).toEqual([
      [300, 1, 500],
      [200, 0, 200],
    ]);
  });

  it('cuts a tween short when a later one starts while it runs (the later wins)', () => {
    const steps = planTrack([seg(0, 1.08, 0.2), seg(0.12, 1, 0.14, 1)]);
    expect(steps.map((s) => [s.delay, s.duration])).toEqual([
      [0, 120],
      [0, 140],
    ]);
  });

  it('sorts by start time and keeps the order of tweens that start together', () => {
    const steps = planTrack([seg(1, 2, 0.1, 0), seg(0, 5, 0, 1), seg(0, 6, 0.3, 2)]);
    expect(steps.map((s) => s.to)).toEqual([5, 6, 2]);
  });

  it('pads a looping track to the period', () => {
    const steps = planTrack([seg(0, 1, 0.5), seg(1, 0, 0.5, 1)], 2.8);
    const last = steps[steps.length - 1];
    expect(last).toMatchObject({ delay: 1300, to: 0, duration: 0 });
    const length = steps.reduce((sum, s) => sum + s.delay + s.duration, 0);
    expect(length).toBe(2800);
  });
});
