import { buildDemoWorld, withExamGoal } from '@mytutor/demo-data';
import { groupDeadlines } from './deadlines';
import { toDeadline } from './fromWorld';
import type { Deadline } from './types';

const today = new Date(2026, 9, 18, 9);
const world = withExamGoal(buildDemoWorld({ now: today, persona: 'nermin' }), {
  kind: 'exam',
  exam: 'graduation_9',
  group: null,
  date: null,
});

describe('groupDeadlines', () => {
  it('puts the next seven days first, later dates by month, official dates last', () => {
    const groups = groupDeadlines(world.exam.deadlines.map(toDeadline), today);
    expect(groups.map((g) => g.key)).toEqual([
      { kind: 'thisWeek' },
      { kind: 'month', month: 10, year: 2026 },
      { kind: 'official' },
    ]);
    expect(groups[0]?.items.map((d) => d.kind)).toEqual(['assignment', 'registrationEnds', 'mock']);
    expect(groups[2]?.items).toHaveLength(2);
  });

  it('sorts by date and drops past dates', () => {
    const items: Deadline[] = [
      { kind: 'registrationEnds', id: 'b', date: new Date(2026, 9, 21), mockNumber: 3 },
      { kind: 'registrationEnds', id: 'old', date: new Date(2026, 9, 10), mockNumber: 2 },
      { kind: 'registrationEnds', id: 'a', date: new Date(2026, 9, 19), mockNumber: 3 },
    ];
    const groups = groupDeadlines(items, today);
    expect(groups).toHaveLength(1);
    expect(groups[0]?.items.map((d) => d.id)).toEqual(['a', 'b']);
  });
});
