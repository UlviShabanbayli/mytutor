import { demoAssignments, demoReports, demoSubjects, NERMIN } from './demoData';
import { groupAssignments, subjectTotals, summaryClauses, unitStats } from './report';
import type { UnitProgress, WeekReport } from './types';

const subject = demoSubjects[NERMIN]?.[0];
const thisWeek = demoReports[NERMIN]?.[0];

const unitOf = (levels: UnitProgress['topics'][number]['level'][]): UnitProgress => ({
  number: '9',
  title: 'Test',
  topics: levels.map((level, i) => ({ number: `9.${i + 1}`, level })),
});

describe('unitStats', () => {
  it('counts honey and sealed cells and names what needs attention', () => {
    expect(unitStats(unitOf(['reinforced', 'needs_practice', 'mastered', 'mastered']))).toEqual({
      done: 3,
      total: 4,
      level: 'lesson_completed',
      note: { kind: 'practice', count: 1 },
    });
    expect(
      unitStats(unitOf(['mastered', 'mastered', 'lesson_completed', 'not_started'])),
    ).toMatchObject({ done: 2, note: { kind: 'learning', count: 1 } });
    expect(unitStats(unitOf(['mastered', 'reinforced']))).toMatchObject({
      level: 'mastered',
      note: { kind: 'all' },
    });
    expect(unitStats(unitOf(['mastered', 'not_started']))).toMatchObject({
      note: { kind: 'remaining', count: 1 },
    });
    expect(unitStats(unitOf(['not_started', 'not_started']))).toMatchObject({
      level: 'not_started',
      note: { kind: 'notStarted' },
    });
  });

  it('gives the design totals for the demo hive box', () => {
    expect(subject && subjectTotals(subject.units)).toEqual({ done: 15, total: 26 });
  });
});

describe('summaryClauses', () => {
  it('lists days, new topics and assignments in order', () => {
    expect(thisWeek && summaryClauses(thisWeek)).toEqual([
      { kind: 'days', count: 5 },
      { kind: 'topics', count: 4 },
      { kind: 'tasksAll', count: 3 },
    ]);
  });

  it('leaves out what is not shared or did not happen', () => {
    const week = thisWeek as WeekReport;
    expect(summaryClauses({ ...week, newTopics: [], assignments: null })).toEqual([
      { kind: 'days', count: 5 },
    ]);
    expect(summaryClauses({ ...week, assignments: { onTime: 2, total: 3 } })[2]).toEqual({
      kind: 'tasksSome',
      onTime: 2,
      total: 3,
    });
    expect(summaryClauses({ ...week, activeDays: week.activeDays.map(() => false) })).toEqual([]);
  });
});

describe('groupAssignments', () => {
  it('splits open and finished work', () => {
    const { active, done } = groupAssignments(demoAssignments[NERMIN]?.items ?? []);
    expect(active.map((a) => a.id)).toEqual(['a1', 'a2']);
    expect(done.map((a) => a.id)).toEqual(['a3', 'a4', 'a5', 'a6']);
  });
});
