import { describe, expect, it } from 'vitest';
import { DEMO_EVENT_TYPES, demoWorldSchema } from '@mytutor/schemas';
import type { AskQuestion, DemoEvent, DemoEventInput, DemoPersona } from '@mytutor/types';
import { answerDemo } from '../selectors/answer';
import { buildDemoWorld } from '../world';
import { applyDemoEvents } from './apply';

const NOW = new Date('2026-10-20T06:00:00.000Z');
let n = 0;
/** An event a few minutes before now, in the order written. */
const ev = (input: DemoEventInput): DemoEvent => {
  n += 1;
  return {
    ...input,
    id: `ev-${n}`,
    at: new Date(NOW.getTime() - (60 - n) * 60_000).toISOString(),
  } as DemoEvent;
};

type Body = Record<string, unknown>;
const get = (path: string, events: DemoEvent[], persona: DemoPersona = 'nermin') => {
  const answer = answerDemo(path, { persona, now: NOW, events });
  return answer.body as Body;
};
const list = (path: string, events: DemoEvent[], persona: DemoPersona = 'nermin') =>
  get(path, events, persona) as unknown as Body[];

const grade = ev({
  type: 'assignment.graded',
  assignmentId: 'hw-4-1',
  studentId: 'nermin',
  score: 9,
  outOf: 10,
  comment: 'Əla!',
});

describe('applyDemoEvents', () => {
  it('is pure: the world it is given never changes, no events give the same world', () => {
    const world = buildDemoWorld({ now: NOW, persona: 'nermin' });
    const before = JSON.stringify(world);
    const after = applyDemoEvents(world, [grade]);
    expect(JSON.stringify(world)).toBe(before);
    expect(after).not.toBe(world);
    expect(applyDemoEvents(world, [])).toBe(world);
    expect(() => demoWorldSchema.parse(after)).not.toThrow();
  });

  it('applies events in time order and ignores events that point at nothing', () => {
    const world = buildDemoWorld({ now: NOW, persona: 'nermin' });
    const unknown = [
      ev({
        type: 'assignment.graded',
        assignmentId: 'hw-9-9',
        studentId: 'nermin',
        score: 1,
        outOf: 2,
      }),
      ev({ type: 'message.sent', threadId: 'nope', fromPersonId: 'nermin', text: 'x' }),
      ev({ type: 'message.sent', threadId: 'dm-lale-orxan', fromPersonId: 'nermin', text: 'x' }),
      ev({ type: 'ask.answered', questionId: 'nope', teacherId: 'lale' }),
      ev({ type: 'class.joined', classId: '9z', studentId: 'nermin' }),
      ev({ type: 'child.linked', parentId: 'nobody', childId: 'nermin' }),
      ev({ type: 'notification.read', notificationId: 'nope' }),
    ];
    expect(JSON.stringify(applyDemoEvents(world, unknown))).toBe(JSON.stringify(world));
    const late = { ...grade, id: 'late', at: NOW.toISOString(), score: 6 } as DemoEvent;
    const swapped = applyDemoEvents(world, [late, grade]);
    expect(swapped.submissions.find((s) => s.id === 'sub-hw-4-1-nermin')?.grade?.score).toBe(6);
  });

  it('Lalə grades hw-4-1: the student, Today, the inbox, the parent and the teacher see it', () => {
    const hw = get('/v1/assignments/hw-4-1', [grade]) as {
      submission: { state: string; grade: unknown; comment: string };
    };
    expect([hw.submission.state, hw.submission.grade, hw.submission.comment]).toEqual([
      'checked',
      { score: 9, max: 10 },
      'Əla!',
    ]);
    const today = get('/v1/today', [grade]) as {
      assignments: { id: string; state: string; grade: unknown }[];
    };
    expect(today.assignments.find((a) => a.id === 'hw-4-1')).toMatchObject({
      state: 'checked',
      grade: { score: 9, max: 10 },
    });
    expect(list('/v1/notifications', [grade]).find((x) => x.id === `n-${grade.id}`)).toMatchObject({
      kind: 'assignmentGraded',
      assignmentId: 'hw-4-1',
      score: 9,
    });
    const parent = get('/v1/parent/children/nermin/assignments', [grade]) as {
      items: { id: string; grade: unknown }[];
    };
    expect(parent.items.find((a) => a.id === 'hw-4-1')?.grade).toEqual({ score: 9, max: 10 });
    const teacher = list('/v1/teacher/assignments', [grade]).find((a) => a.id === 'hw-4-1');
    expect(teacher?.toGrade).toBe(5);
    expect(
      list('/v1/teacher/notifications', [grade]).find((x) => x.kind === 'homework')?.count,
    ).toBe(5);
  });

  it('creates and hands in assignments', () => {
    const created = ev({
      type: 'assignment.created',
      assignment: {
        id: 'quiz-4-3',
        classId: '7b',
        kind: 'test',
        topicId: 'riyaziyyat-7-4-3',
        title: '4.3 testi',
        description: '',
        itemCount: 3,
        testId: 'test-riyaziyyat-7-4-3',
        audience: { type: 'class' },
        assignedAt: NOW.toISOString(),
        dueAt: '2026-10-23T19:59:00.000Z',
      },
    });
    const submitted = ev({
      type: 'assignment.submitted',
      assignmentId: 'quiz-4-3',
      studentId: 'nermin',
    });
    expect(list('/v1/assignments', [created]).map((a) => a.id)).toContain('quiz-4-3');
    expect(
      list('/v1/notifications', [created]).find((x) => x.id === `n-${created.id}`),
    ).toMatchObject({
      kind: 'newAssignment',
      assignmentId: 'quiz-4-3',
    });
    const mine = get('/v1/assignments/quiz-4-3', [created, submitted]) as {
      submission: { state: string };
    };
    expect(mine.submission.state).toBe('submitted');
    const teacher = list('/v1/teacher/assignments', [created, submitted]).find(
      (a) => a.id === 'quiz-4-3',
    );
    expect([teacher?.done, teacher?.total]).toEqual([1, 24]);
    // A graded piece of work stays graded when handed in again.
    const again = ev({ type: 'assignment.submitted', assignmentId: 'hw-4-1', studentId: 'nermin' });
    const hw = get('/v1/assignments/hw-4-1', [grade, again]) as { submission: { state: string } };
    expect(hw.submission.state).toBe('checked');
  });

  it('shows messages on both sides of the 7B chat and the parent–teacher chat', () => {
    const toClass = ev({
      type: 'message.sent',
      threadId: 'chat-7b',
      fromPersonId: 'nermin',
      text: 'Sabah görüşərik',
    });
    const toParent = ev({
      type: 'message.sent',
      threadId: 'dm-lale-sebine',
      fromPersonId: 'lale',
      text: 'Nərmin əla işləyir',
    });
    const reply = ev({
      type: 'message.sent',
      threadId: 'dm-lale-sebine',
      fromPersonId: 'sebine',
      text: 'Sağ olun!',
    });
    const events = [toClass, toParent, reply];
    const classChat = get('/v1/teacher/messages/chat-7b', events) as {
      messages: { text: string; mine: boolean }[];
      unread: number;
    };
    expect(classChat.messages.at(-1)).toMatchObject({ text: 'Sabah görüşərik', mine: false });
    const mine = get('/v1/messages/chat-7b', events) as {
      messages: { mine: boolean }[];
      unread: number;
    };
    expect(mine.messages.at(-1)?.mine).toBe(true);
    const parent = get('/v1/parent/messages/dm-lale-sebine', events) as {
      messages: { text: string }[];
    };
    expect(parent.messages.slice(-2).map((m) => m.text)).toEqual([
      'Nərmin əla işləyir',
      'Sağ olun!',
    ]);
    expect(
      list('/v1/parent/notifications', [toParent]).find((x) => x.id === `n-${toParent.id}`),
    ).toMatchObject({
      kind: 'teacherMessage',
      threadId: 'dm-lale-sebine',
    });
    const teacherList = list('/v1/teacher/messages', [toParent, reply]).find(
      (t) => t.id === 'dm-lale-sebine',
    );
    expect(teacherList?.unread).toBe(1);
  });

  it('Nərmin asks, Lalə’s inbox has it; Lalə approves, Nərmin sees the teacher’s answer', () => {
    const question: AskQuestion = {
      id: 'q-nermin-6',
      studentId: 'nermin',
      classId: '7b',
      queue: 'teacher',
      teacherId: 'lale',
      subjectId: 'riyaziyyat-7',
      topicId: 'riyaziyyat-7-4-2',
      title: '(x + 5)(x − 5) hasilini tap',
      mark: '(x+5)(x−5)',
      photoUri: null,
      note: '',
      status: 'teacher_checking',
      timeline: [{ event: 'sent', at: '2026-10-20T05:59:30.000Z' }],
      aiDraft: {
        status: 'ready',
        answer: 'x² − 25',
        steps: [{ id: 's1', text: 'Düstur', formula: '(a + b)(a − b) = a² − b²' }],
      },
      answer: null,
      source: null,
      similar: [],
    };
    const sent = ev({ type: 'ask.sent', question });
    expect(list('/v1/ask/questions', [sent])[0]?.id).toBe('q-nermin-6');
    expect(list('/v1/teacher/inbox', [sent])[0]?.id).toBe('q-nermin-6');
    expect(
      list('/v1/teacher/notifications', [sent]).find((x) => x.id === `n-${sent.id}`),
    ).toMatchObject({
      kind: 'question',
      questionId: 'q-nermin-6',
    });
    expect((get('/v1/ask/usage', [sent]) as { photoUsed: number }).photoUsed).toBe(3);
    const approved = ev({ type: 'ask.answered', questionId: 'q-nermin-6', teacherId: 'lale' });
    // Applying the log never changes the events: the same log answers every query.
    const log = JSON.stringify([sent, approved]);
    get('/v1/ask/questions', [sent, approved]);
    expect(JSON.stringify([sent, approved])).toBe(log);
    const mine = get('/v1/ask/questions/q-nermin-6', [sent, approved]) as AskQuestion;
    expect([mine.status, mine.answer?.correctedAi, mine.answer?.steps.length]).toEqual([
      'answered',
      false,
      1,
    ]);
    expect(
      list('/v1/notifications', [sent, approved]).find((x) => x.id === `n-${approved.id}`),
    ).toMatchObject({
      kind: 'answerReady',
      questionId: 'q-nermin-6',
    });
    const edited = ev({
      type: 'ask.answered',
      questionId: 'q-nermin-1',
      teacherId: 'lale',
      note: 'İşarələrə bax.',
    });
    const one = get('/v1/ask/questions/q-nermin-1', [edited]) as AskQuestion;
    expect([one.status, one.answer?.teacherNote, one.answer?.correctedAi]).toEqual([
      'answered',
      'İşarələrə bax.',
      true,
    ]);
    const solving = ev({
      type: 'ask.answered',
      questionId: 'q-tural-1',
      teacherId: 'lale',
      note: 'x² − x − 6',
    });
    const tural = (get('/v1/teacher/inbox/q-tural-1', [solving]) as AskQuestion).answer;
    expect(tural?.steps[0]?.text).toBe('x² − x − 6');
  });

  it('joins and leaves classes; the teacher can remove a student', () => {
    // Joined a minute ago: only what was written since then would be unread.
    const join = {
      ...ev({ type: 'class.joined', classId: '7b', studentId: 'yeni-sagird' }),
      at: '2026-10-20T05:59:00.000Z',
    } as DemoEvent;
    expect(list('/v1/classes', [join], 'fresh').map((c) => c.id)).toEqual(['7b']);
    expect(list('/v1/assignments', [join], 'fresh').map((a) => a.id)).toContain('quiz-4-2');
    expect((get('/v1/messages/chat-7b', [join], 'fresh') as { unread: number }).unread).toBe(0);
    const roster = get('/v1/teacher/classes/7b', [join], 'fresh') as { members: unknown[] };
    expect(roster.members).toHaveLength(25);
    const left = ev({ type: 'class.left', classId: '7b', studentId: 'nermin' });
    expect(list('/v1/classes', [left])).toEqual([]);
    expect(
      answerDemo('/v1/messages/chat-7b', { persona: 'nermin', now: NOW, events: [left] }).status,
    ).toBe(404);
    const removed = ev({ type: 'member.removed', classId: '7b', studentId: 'tural' });
    const after = get('/v1/teacher/classes/7b', [removed]) as { members: { personId: string }[] };
    expect(after.members.map((m) => m.personId)).not.toContain('tural');
  });

  it('Səbinə unlinks and links again with K7Q42M: both sides show the link', () => {
    const unlinked = ev({ type: 'child.unlinked', parentId: 'sebine', childId: 'nermin' });
    const home = get('/v1/parent', [unlinked]) as { children: { childId: string }[] };
    expect(home.children.map((c) => c.childId)).toEqual(['elvin']);
    expect(
      (get('/v1/parent/codes/K7Q42M', [unlinked]) as { alreadyLinked: boolean }).alreadyLinked,
    ).toBe(false);
    const linked = ev({ type: 'child.linked', parentId: 'sebine', childId: 'nermin' });
    const again = get('/v1/parent', [unlinked, linked]) as {
      children: { childId: string; status: string; relation: string }[];
    };
    expect(again.children.find((c) => c.childId === 'nermin')).toMatchObject({
      status: 'active',
      relation: 'mother',
    });
    const me = get('/v1/me', [unlinked, linked]) as {
      parents: { parentId: string; status: string }[];
    };
    expect(me.parents.find((p) => p.parentId === 'sebine')?.status).toBe('active');
    const father = ev({ type: 'child.linked', parentId: 'elcin', childId: 'nermin' });
    const both = get('/v1/me', [father]) as { parents: { parentId: string; status: string }[] };
    expect(both.parents.find((p) => p.parentId === 'elcin')?.status).toBe('active');
  });

  it('decides consent for a child under 13', () => {
    const approve = ev({
      type: 'consent.decided',
      parentId: 'sebine',
      childId: 'elvin',
      approved: true,
    });
    const home = get('/v1/parent', [approve]) as {
      children: { childId: string; status: string; grants: string[] }[];
      consentRequests: unknown[];
    };
    expect(home.children.find((c) => c.childId === 'elvin')).toMatchObject({
      status: 'active',
      grants: ['report', 'progress', 'assignments'],
    });
    expect(home.consentRequests).toEqual([]);
    const decline = ev({
      type: 'consent.decided',
      parentId: 'sebine',
      childId: 'elvin',
      approved: false,
    });
    expect((get('/v1/parent', [decline]) as { children: unknown[] }).children).toHaveLength(1);
  });

  it('marks notifications read', () => {
    const read = ev({ type: 'notification.read', notificationId: 'n-st-answer' });
    expect(list('/v1/notifications', [read]).find((x) => x.id === 'n-st-answer')?.read).toBe(true);
  });

  it('sets the exam goal: the exam follows without a query parameter', () => {
    const goal = ev({
      type: 'exam.goalSet',
      goal: { kind: 'exam', exam: 'graduation_9', group: null, date: null },
    });
    const exam = get('/v1/exam', [goal]) as {
      goal: { kind: string };
      readiness: { subject: string; percent?: number }[];
    };
    expect(exam.goal.kind).toBe('exam');
    expect(exam.readiness.find((r) => r.subject === 'math')?.percent).toBe(58);
    expect(
      (get('/v1/me', [goal]) as { profile: { goal: { kind: string } } }).profile.goal.kind,
    ).toBe('exam');
    const back = ev({ type: 'exam.goalSet', goal: { kind: 'school' } });
    expect((get('/v1/exam', [goal, back]) as { plan: unknown }).plan).toBeNull();
  });

  it('has a test for every event type', () => {
    const tested = new Set([
      'assignment.created',
      'assignment.submitted',
      'assignment.graded',
      'message.sent',
      'ask.sent',
      'ask.answered',
      'class.joined',
      'class.left',
      'member.removed',
      'child.linked',
      'child.unlinked',
      'consent.decided',
      'notification.read',
      'exam.goalSet',
    ]);
    expect(DEMO_EVENT_TYPES.filter((t) => !tested.has(t))).toEqual([]);
  });
});
