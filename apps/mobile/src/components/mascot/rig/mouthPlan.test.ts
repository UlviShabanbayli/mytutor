import { MOUTH } from './data/faces';
import { initialMouth, mouthOpacity, planMouth } from './mouthPlan';

describe('planMouth', () => {
  it('opens a smile into a laugh starting from the smile line', () => {
    const plan = planMouth(initialMouth('smile'), 'laugh');
    expect(plan.fromKind).toBe('line');
    expect(plan.toKind).toBe('open');
    expect(plan.mO.from).toEqual(MOUTH.smile.shape);
    expect(plan.mO.to).toEqual(MOUTH.laugh.shape);
    expect(plan.mT.to).toEqual(MOUTH.laugh.tongue);
    expect(plan.next.kind).toBe('open');
  });

  it('closes an open mouth into a line, flattening the lips and tucking the tongue', () => {
    const plan = planMouth(initialMouth('laugh'), 'grin');
    expect(plan.mL.from).toEqual(MOUTH.grin.shape);
    expect(plan.mO.to).toEqual(MOUTH.grin.shape);
    expect(plan.mT.to).toEqual([101, 131, 104, 133, 107, 131]);
  });

  it('rounds into an "o" from a small ellipse and shrinks it when leaving', () => {
    const into = planMouth(initialMouth('smile'), 'o');
    expect(into.mE.from).toEqual([100, 132, 1.5, 1]);
    expect(into.mE.to).toEqual(MOUTH.o.shape);
    const out = planMouth(into.next, 'smile');
    expect(out.mE.to).toEqual([100, 132, 1, 1]);
  });

  it('fades the new kind in by half the tween and the old one out by 70%', () => {
    expect(mouthOpacity('open', 'line', 'open')).toEqual([1, 0.5]);
    expect(mouthOpacity('line', 'line', 'open')).toEqual([0, 0.71]);
    expect(mouthOpacity('o', 'line', 'open')).toEqual([0, 0.5]);
  });
});
