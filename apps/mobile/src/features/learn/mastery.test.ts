import { demoHive } from './demo';
import {
  findTopic,
  findUnit,
  hiveCounts,
  nextStep,
  raiseLevel,
  unitLevel,
  unitSummary,
  withState,
} from './mastery';

const unit = (n: number) => {
  const found = demoHive.units[n - 1];
  if (!found) throw new Error(`no unit ${n}`);
  return found;
};

describe('mastery', () => {
  it('counts the demo student as 17 of 26 cells filled', () => {
    expect(hiveCounts(demoHive)).toEqual({ filled: 17, total: 26 });
  });

  it('only ever raises a level', () => {
    expect(raiseLevel('not_started', 'mastered')).toBe('mastered');
    expect(raiseLevel('reinforced', 'mastered')).toBe('reinforced');
    expect(raiseLevel('needs_practice', 'mastered')).toBe('mastered');
    expect(raiseLevel('lesson_completed', 'not_started')).toBe('lesson_completed');
  });

  it('gives each unit its badge level', () => {
    expect(unitLevel(unit(1))).toBe('reinforced');
    expect(unitLevel(unit(2))).toBe('mastered');
    expect(unitLevel(unit(4))).toBe('lesson_completed');
    expect(unitLevel(unit(5))).toBe('not_started');
  });

  it('summarises a unit for its frame', () => {
    expect(unitSummary(unit(2), demoHive)).toMatchObject({ filled: 4, crystals: 1, sealed: true });
    expect(unitSummary(unit(4), demoHive)).toMatchObject({
      filled: 2,
      total: 5,
      hasCurrent: true,
      onPhone: true,
    });
    expect(unitSummary(unit(5), demoHive).onPhone).toBe(false);
  });

  it('finds topics and units by id or by textbook number', () => {
    expect(findTopic(demoHive, '4.3')?.topic.id).toBe('riyaziyyat-7-4-3');
    expect(findTopic(demoHive, 'riyaziyyat-7-4-3')).toMatchObject({ index: 2, globalIndex: 17 });
    expect(findTopic(demoHive, 'r7-4-3')?.topic.number).toBe('4.3');
    expect(findTopic(demoHive, 'r7-4.3')?.topic.number).toBe('4.3');
    expect(findTopic(demoHive, 'nope')).toBeNull();
    expect(findTopic(demoHive, '9.9')).toBeNull();
    expect(findUnit(demoHive, '4')?.unit.id).toBe('riyaziyyat-7-u4');
    expect(findUnit(demoHive, 'riyaziyyat-7-u5')?.index).toBe(4);
  });

  it('continues with the current step', () => {
    const place = findTopic(demoHive, '4.3');
    expect(place && nextStep(place.topic)).toBe('examples');
  });

  it('applies what the device knows on top of the hive', () => {
    const hive = withState(demoHive, {
      levels: { 'riyaziyyat-7-5-1': 'mastered', 'riyaziyyat-7-1-1': 'mastered' },
      currentTopicId: 'riyaziyyat-7-5-2',
      savedTopicIds: ['riyaziyyat-7-5-1'],
    });
    expect(findTopic(hive, '5.1')?.topic.level).toBe('mastered');
    expect(findTopic(hive, '5.1')?.topic.steps.every((s) => s.state === 'done')).toBe(true);
    expect(findTopic(hive, '1.1')?.topic.level).toBe('reinforced');
    expect(hive.currentTopicId).toBe('riyaziyyat-7-5-2');
    expect(hive.savedTopicIds).toContain('riyaziyyat-7-5-1');
  });
});
