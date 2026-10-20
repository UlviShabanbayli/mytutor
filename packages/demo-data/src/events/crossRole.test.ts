import { describe, expect, it } from 'vitest';
import type { AskQuestion, DemoEvent } from '@mytutor/types';
import { NOW, ev, get, grade, list } from './testEvents';

describe('demo events across roles', () => {
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
    // Written in the last minutes, after everyone last read the conversation.
    const toParent = {
      ...ev({
        type: 'message.sent',
        threadId: 'dm-lale-sebine',
        fromPersonId: 'lale',
        text: 'Nərmin əla işləyir',
      }),
      at: '2026-10-20T05:58:00.000Z',
    } as DemoEvent;
    const reply = {
      ...ev({
        type: 'message.sent',
        threadId: 'dm-lale-sebine',
        fromPersonId: 'sebine',
        text: 'Sağ olun!',
      }),
      at: '2026-10-20T05:59:00.000Z',
    } as DemoEvent;
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
});
