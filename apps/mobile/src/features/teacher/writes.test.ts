import {
  chatThreadDetailSchema,
  curriculumResponseSchema,
  studentAssignmentSchema,
  teacherClassDetailSchema,
} from '@mytutor/schemas';
import type { SolutionStep } from '@mytutor/types';
import { NOW, answer, ev } from './testWorld';
import { contentsOf } from './views';
import { answerNote, assignmentIdFor, newAssignment } from './writes';

const contents = contentsOf(answer('/v1/curriculum', curriculumResponseSchema.parse));
const unit = contents.units.find((u) => u.number === '4');
const topic = unit?.topics.find((t) => t.number === '4.4');

describe('assignment.created', () => {
  if (!unit || !topic) throw new Error('unit 4 is missing');
  const draft = {
    classId: '7b',
    topic,
    unit,
    audience: { type: 'class' as const },
    dueAt: '2026-10-23T19:59:00.000Z',
    title: '4.4 testi',
    description: 'Qısa test.',
  };

  it('names assignments by the one id scheme and avoids taken ids', () => {
    expect(assignmentIdFor('test', topic, unit, [])).toBe('quiz-4-4');
    expect(assignmentIdFor('homework', topic, unit, ['hw-4-4'])).toBe('hw-4-4-2');
    expect(assignmentIdFor('mock', topic, unit, [])).toBe('mock-u4');
  });

  it('leads a test to the topic’s test and a unit test to the unit’s', () => {
    expect(newAssignment({ ...draft, kind: 'test' }, [], NOW)).toMatchObject({
      id: 'quiz-4-4',
      topicId: 'riyaziyyat-7-4-4',
      testId: 'test-riyaziyyat-7-4-4',
      assignedAt: NOW.toISOString(),
    });
    expect(newAssignment({ ...draft, kind: 'mock' }, [], NOW)).toMatchObject({
      unitId: 'riyaziyyat-7-u4',
      testId: 'test-riyaziyyat-7-u4',
    });
  });

  it('reaches Nərmin’s assignments and the teacher’s class', () => {
    const assignment = newAssignment({ ...draft, kind: 'test' }, [], NOW);
    const created = ev({ type: 'assignment.created', assignment });
    const mine = answer('/v1/assignments', studentAssignmentSchema.array().parse, [created]);
    expect(mine.find((a) => a.id === 'quiz-4-4')?.title).toBe('4.4 testi');
    const cls = answer('/v1/teacher/classes/7b', teacherClassDetailSchema.parse, [created]);
    expect(cls.assignments.find((a) => a.id === 'quiz-4-4')?.total).toBe(24);
  });
});

describe('teacher writes other roles see', () => {
  it('puts Lalə’s message in the 7B chat Nərmin reads', () => {
    const sent = ev({
      type: 'message.sent',
      threadId: 'chat-7b',
      fromPersonId: 'lale',
      text: 'Sabah görüşərik!',
    });
    const thread = answer('/v1/messages/chat-7b', chatThreadDetailSchema.parse, [sent]);
    expect(thread.messages.at(-1)).toMatchObject({ text: 'Sabah görüşərik!', mine: false });
  });

  it('takes a removed student off the roster', () => {
    const removed = ev({ type: 'member.removed', classId: '7b', studentId: 'orxan' });
    const cls = answer('/v1/teacher/classes/7b', teacherClassDetailSchema.parse, [removed]);
    expect(cls.members.map((m) => m.personId)).not.toContain('orxan');
    expect(cls.class.studentCount).toBe(23);
  });
});

describe('answerNote', () => {
  const step = (id: string, text: string, formula: string): SolutionStep => ({ id, text, formula });
  const ai = [step('s1', 'Düstur', '(a + b)³'), step('s2', 'Hesabla', '8x³')];
  const line = (n: number, s: SolutionStep) => `${n}. ${s.text} ${s.formula}`;

  it('says nothing when the AI’s steps are approved as they are', () => {
    expect(answerNote(ai, ai, line)).toBeUndefined();
  });

  it('writes the teacher’s whole solution once she changed it', () => {
    const fixed = [ai[0] ?? step('x', '', ''), step('s2', 'Hesabla', '8x³ + 1')];
    expect(answerNote(ai, fixed, line)).toBe('1. Düstur (a + b)³\n2. Hesabla 8x³ + 1');
    expect(answerNote(ai, ai.slice(0, 1), line)).toBe('1. Düstur (a + b)³');
  });
});
