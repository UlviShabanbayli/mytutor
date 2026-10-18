import { flightDayNumber, goalProgress, weekCells } from './goal';

describe('goalProgress', () => {
  it('counts minutes left towards the goal', () => {
    expect(goalProgress(12, 20)).toEqual({
      done: 12,
      goal: 20,
      left: 8,
      complete: false,
      fraction: 0.6,
    });
  });

  it('is complete at or above the goal and never overfills the ring', () => {
    const progress = goalProgress(25, 20);
    expect(progress.complete).toBe(true);
    expect(progress.left).toBe(0);
    expect(progress.fraction).toBe(1);
  });

  it('guards against a zero goal and negative minutes', () => {
    expect(goalProgress(-3, 0)).toMatchObject({ done: 0, goal: 1, complete: false });
  });
});

describe('weekCells', () => {
  const week = [true, true, false, true, false, false, false];

  it('fills active days and marks today by its progress', () => {
    expect(weekCells(week, 4, goalProgress(12, 20))).toEqual([
      'done',
      'done',
      'empty',
      'done',
      'todayStarted',
      'empty',
      'empty',
    ]);
  });

  it('shows today unstarted with no minutes and no activity', () => {
    expect(weekCells(week, 6, goalProgress(0, 20))[6]).toBe('today');
  });

  it('counts a finished test today as started and a reached goal as done', () => {
    expect(weekCells([false, true], 1, goalProgress(0, 20))[1]).toBe('todayStarted');
    expect(weekCells([false, false], 1, goalProgress(20, 20))[1]).toBe('done');
  });
});

describe('flightDayNumber', () => {
  it('adds today to a streak that does not include it yet', () => {
    expect(flightDayNumber(12, false)).toBe(13);
    expect(flightDayNumber(0, false)).toBe(1);
  });

  it('keeps a streak that already counts today', () => {
    expect(flightDayNumber(3, true)).toBe(3);
  });
});
