import { answerDemo } from '@mytutor/demo-data';
import { studentAssignmentSchema } from '@mytutor/schemas';
import { openAssignmentFor, resultKind } from './handIn';

const NOW = new Date('2026-10-20T06:00:00.000Z');

const assignmentsOf = (persona: 'nermin' | 'fresh') => {
  const answer = answerDemo('/v1/assignments', { persona, now: NOW });
  return studentAssignmentSchema.array().parse(answer.body);
};

describe('openAssignmentFor', () => {
  it('finds the open 4.2 test Nərmin has to hand in', () => {
    const found = openAssignmentFor(assignmentsOf('nermin'), 'test-riyaziyyat-7-4-2');
    expect(found?.id).toBe('quiz-4-2');
  });

  it('finds nothing for a test nobody assigned or for a student without classes', () => {
    expect(openAssignmentFor(assignmentsOf('nermin'), 'test-riyaziyyat-7-4-5')).toBeNull();
    expect(openAssignmentFor(assignmentsOf('fresh'), 'test-riyaziyyat-7-4-2')).toBeNull();
  });

  it('does not hand in twice', () => {
    const [first] = assignmentsOf('nermin').filter((a) => a.id === 'quiz-4-2');
    if (!first) throw new Error('quiz-4-2 missing');
    const handedIn = {
      ...first,
      submission: {
        id: 's',
        assignmentId: first.id,
        studentId: 'nermin',
        state: 'submitted' as const,
        progress: null,
        submittedAt: NOW.toISOString(),
        photos: 0,
        pages: [],
        ai: null,
        grade: null,
        comment: '',
        gradedAt: null,
      },
    };
    expect(openAssignmentFor([handedIn], 'test-riyaziyyat-7-4-2')).toBeNull();
  });
});

describe('resultKind', () => {
  const study = (kind: 'topic' | 'unit' | 'review' | 'mistakes' | 'demo') =>
    ({ kind }) as Parameters<typeof resultKind>[0];
  it('keeps unit and review results apart from practice', () => {
    expect(
      ['topic', 'unit', 'review', 'mistakes', 'demo'].map((k) => resultKind(study(k as 'topic'))),
    ).toEqual(['practice', 'unit', 'review', 'practice', 'practice']);
  });
});
