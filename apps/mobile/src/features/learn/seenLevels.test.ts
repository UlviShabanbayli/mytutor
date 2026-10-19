import { seenChange, useSeenLevels } from './seenLevels';

describe('seenChange', () => {
  it('animates only from a level seen before that differs', () => {
    expect(seenChange({}, 't1', 'mastered')).toBeUndefined();
    expect(seenChange({ t1: 'mastered' }, 't1', 'mastered')).toBeUndefined();
    expect(seenChange({ t1: 'lesson_completed' }, 't1', 'mastered')).toBe('lesson_completed');
  });
});

describe('useSeenLevels', () => {
  it('remembers the last level seen per topic', () => {
    useSeenLevels.getState().see('t1', 'not_started');
    useSeenLevels.getState().see('t1', 'lesson_completed');
    expect(useSeenLevels.getState().levels.t1).toBe('lesson_completed');
  });
});
