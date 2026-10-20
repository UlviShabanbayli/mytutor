import {
  buildDemoWorld,
  selectChildAssignments,
  selectChildProgress,
  selectChildReport,
} from '@mytutor/demo-data';
import type { MasteryLevel, UnitProgress, WeekReport } from '@mytutor/types';
import { toAssignmentItem } from './map';
import { groupAssignments, subjectTotals, summaryClauses, unitStats } from './report';

const world = buildDemoWorld({ now: new Date('2026-10-20T06:00:00.000Z'), persona: 'nermin' });
const subject = selectChildProgress(world, 'nermin')?.[0];
const thisWeek = selectChildReport(world, 'nermin', 0)?.report;

const unitOf = (levels: MasteryLevel[]): UnitProgress => ({
  unitId: 'u9',
  number: '9',
  title: 'Test',
  topics: levels.map((level, i) => ({ topicId: `t${i}`, number: `9.${i + 1}`, level })),
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

  it('gives the one mastery map: 15 of the 26 cells of Riyaziyyat 7 are honey', () => {
    expect(subject && subjectTotals(subject.units)).toEqual({ done: 15, total: 26 });
  });
});

describe('summaryClauses', () => {
  it('lists days, new topics and assignments in order', () => {
    expect(thisWeek && summaryClauses(thisWeek)).toEqual([
      { kind: 'days', count: 6 },
      { kind: 'topics', count: 4 },
      { kind: 'tasksAll', count: 3 },
    ]);
  });

  it('leaves out what is not shared or did not happen', () => {
    const week = thisWeek as WeekReport;
    expect(summaryClauses({ ...week, newTopics: [], assignments: null })).toEqual([
      { kind: 'days', count: 6 },
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
  it('splits open and finished work, hw-4-1 waiting for the grade among the finished', () => {
    const items = (selectChildAssignments(world, 'nermin')?.items ?? []).map(toAssignmentItem);
    const { active, done } = groupAssignments(items);
    expect(active.length + done.length).toBe(items.length);
    expect(active.every((a) => a.state !== 'submitted' && a.state !== 'checked')).toBe(true);
    expect(done.find((a) => a.id === 'hw-4-1')).toMatchObject({ state: 'submitted', score: null });
  });
});
