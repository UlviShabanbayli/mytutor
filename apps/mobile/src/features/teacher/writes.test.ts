import {
  chatThreadDetailSchema,
  chatThreadViewSchema,
  classFeedSchema,
  curriculumResponseSchema,
  teacherHomeSchema,
  studentAssignmentSchema,
  teacherClassDetailSchema,
} from '@mytutor/schemas';
import type { SolutionStep } from '@mytutor/types';
import { NOW, answer, ev } from './testWorld';
import { classDetailOf, contentsOf, conversationOf } from './views';
import { assignmentIdFor, editedSteps, newAssignment } from './writes';

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

describe('editedSteps', () => {
  const step = (id: string, text: string, formula: string): SolutionStep => ({ id, text, formula });
  const ai = [step('s1', 'Düstur', '(a + b)³'), step('s2', 'Hesabla', '8x³')];

  it('sends nothing when the AI’s steps are approved as they are', () => {
    expect(editedSteps(ai, ai)).toBeUndefined();
  });

  it('sends the teacher’s whole solution, marking the steps she changed', () => {
    const fixed = [ai[0] ?? step('x', '', ''), step('s2', 'Hesabla', '8x³ + 1')];
    expect(editedSteps(ai, fixed)).toEqual([ai[0], { ...fixed[1], edited: true }]);
    expect(editedSteps(ai, ai.slice(0, 1))).toEqual([ai[0]]);
  });
});

describe('the class events the teacher screens write', () => {
  const detail = (events: ReturnType<typeof ev>[]) =>
    classDetailOf(
      contents,
      answer('/v1/teacher/classes/7b', teacherClassDetailSchema.parse, events),
    );

  it('a new class is in the list, with its code', () => {
    const created = ev({
      type: 'class.created',
      class: {
        id: '7c',
        shortName: '7C',
        name: '7C · Riyaziyyat',
        subjectId: 'riyaziyyat-7',
        subject: 'Riyaziyyat',
        grade: 7,
        teacherId: 'lale',
        joinCode: '7C-MATH-2Q8',
        paid: false,
        groups: [],
        chatOpen: true,
      },
    });
    const home = answer('/v1/teacher', teacherHomeSchema.parse, [created]);
    expect(home.classes.find((c) => c.id === '7c')?.joinCode).toBe('7C-MATH-2Q8');
  });

  it('an announcement shows on the class page and in the students’ feed', () => {
    const posted = ev({
      type: 'announcement.posted',
      classId: '7b',
      authorId: 'lale',
      text: 'Cümə test var.',
    });
    expect(detail([posted]).announcements[0]?.text).toBe('Cümə test var.');
    const feed = answer('/v1/classes/7b', classFeedSchema.parse, [posted]);
    expect(feed.announcements[0]?.text).toBe('Cümə test var.');
  });

  it('groups, mutes and the chat switch are kept', () => {
    const group = ev({
      type: 'group.saved',
      classId: '7b',
      group: { id: 'group-2', name: 'Olimpiada', memberIds: ['aysel'] },
    });
    const mute = ev({ type: 'member.muted', classId: '7b', studentId: 'aysel', muted: true });
    const closed = ev({ type: 'class.chatSet', classId: '7b', open: false });
    const d = detail([group, mute, closed]);
    expect(d.class.groups.map((g) => g.id)).toEqual(['boost', 'group-2']);
    expect(d.members.find((m) => m.personId === 'aysel')?.mutedInChat).toBe(true);
    expect(d.class.chatOpen).toBe(false);
  });

  it('a parent conversation carries the child’s name', () => {
    const list = answer('/v1/teacher/messages', chatThreadViewSchema.array().parse).map(
      conversationOf,
    );
    expect(list.find((c) => c.id === 'dm-lale-sebine')?.childName).toBe('Nərmin Əliyeva');
  });
});
