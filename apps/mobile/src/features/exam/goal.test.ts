import { groupThousands } from './format';
import { examDaysLeft, examGoalOf, isGoalComplete } from './goal';

const today = new Date(2026, 9, 18);

describe('exam goal', () => {
  it('reads only exam goals', () => {
    expect(examGoalOf(null)).toBeNull();
    expect(examGoalOf({ kind: 'school' })).toBeNull();
    expect(examGoalOf({ kind: 'exam', exam: 'admission', group: 'II', date: null })?.group).toBe(
      'II',
    );
  });

  it('counts days to a known date, else shows the demo counter', () => {
    expect(
      examDaysLeft({ kind: 'exam', exam: 'graduation_11', group: null, date: null }, today, 142),
    ).toBe(142);
    expect(
      examDaysLeft(
        { kind: 'exam', exam: 'graduation_11', group: null, date: '2026-10-28' },
        today,
        142,
      ),
    ).toBe(10);
  });

  it('needs a group for admission', () => {
    expect(isGoalComplete({ kind: 'exam', exam: 'admission', group: null, date: null })).toBe(
      false,
    );
    expect(isGoalComplete({ kind: 'exam', exam: 'graduation_9', group: null, date: null })).toBe(
      true,
    );
  });
});

describe('groupThousands', () => {
  it('joins thousands with a no-break space', () => {
    expect(groupThousands(1248)).toBe('1 248');
    expect(groupThousands(24)).toBe('24');
    expect(groupThousands(1234567)).toBe('1 234 567');
  });
});
