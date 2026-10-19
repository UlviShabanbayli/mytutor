import { lastStep, planEntry, rememberStep } from './stepEntry';

describe('step entry', () => {
  it('shows the first screen of a track at once', () => {
    expect(planEntry({ track: 'start', step: 1 }, null, false)).toEqual({ dir: 0, from: null });
    expect(planEntry({ track: 'account', step: 1 }, { track: 'start', step: 5 }, false)).toEqual({
      dir: 0,
      from: null,
    });
  });

  it('slides forward on a new step and back on a step returned to', () => {
    const goal = { track: 'start', step: 4 } as const;
    expect(planEntry(goal, { track: 'start', step: 3 }, false)).toEqual({ dir: 1, from: 3 });
    expect(planEntry(goal, { track: 'start', step: 5 }, true)).toEqual({ dir: -1, from: 5 });
  });

  it('remembers the last step shown', () => {
    rememberStep({ track: 'start', step: 2 });
    rememberStep(null);
    expect(lastStep()).toEqual({ track: 'start', step: 2 });
  });
});
