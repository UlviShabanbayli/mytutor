import {
  askQuestionViewSchema,
  classInsightsSchema,
  curriculumResponseSchema,
  liveLessonSchema,
  materialSchema,
  bankQuestionSchema,
  notificationSchema,
  teacherAssignmentSchema,
  teacherClassDetailSchema,
  teacherHomeSchema,
} from '@mytutor/schemas';
import { answer, ev } from './testWorld';
import {
  assignmentOf,
  classOf,
  contentsOf,
  currentUnit,
  inboxQuestionOf,
  insightsOf,
  liveRoomOf,
  materialSize,
  noticesOf,
  profileOf,
  testStartOf,
} from './views';

const contents = contentsOf(answer('/v1/curriculum', curriculumResponseSchema.parse));
const assignments = () => answer('/v1/teacher/assignments', teacherAssignmentSchema.array().parse);

describe('teacher views of the demo world', () => {
  it('reads the ready volume and the unit the classes work on', () => {
    const unit = currentUnit(contents, assignments());
    expect(unit?.id).toBe('riyaziyyat-7-u4');
    expect(unit?.bookTitle).toBe('Riyaziyyat 7 (TRİMS)');
    expect(unit?.topics.map((t) => t.number)).toEqual(['4.1', '4.2', '4.3', '4.4', '4.5']);
    expect(unit?.topics[0]).toMatchObject({ id: 'riyaziyyat-7-4-1', page: 83 });
  });

  it('shows Lalə, her two classes and hw-4-1 waiting for six grades', () => {
    const home = answer('/v1/teacher', teacherHomeSchema.parse);
    expect(profileOf(home)).toMatchObject({ name: 'Lalə Həsənova', verification: 'pending' });
    expect(home.classes.map(classOf).map((c) => [c.shortName, c.book, c.joinCode])).toEqual([
      ['7B', 'Riyaziyyat 7', '7B-MATH-4K2'],
      ['7A', 'Riyaziyyat 7', '7A-MATH-9P7'],
    ]);
    const list = assignments().map((a) => assignmentOf(contents, a));
    const hw = list.find((a) => a.id === 'hw-4-1');
    expect([hw?.topic?.number, hw?.toGrade, hw?.total]).toEqual(['4.1', 6, 24]);
    expect(list.find((a) => a.id === 'mock-u3')?.unitNumber).toBe('3');
  });

  it('keeps 7B to one roster of 24 full names', () => {
    const detail = answer('/v1/teacher/classes/7b', teacherClassDetailSchema.parse);
    expect(detail.members).toHaveLength(24);
    expect(detail.members[0]).toMatchObject({ personId: 'nermin', name: 'Nərmin Əliyeva' });
  });

  it('turns a grade into one fewer homework to check, in the list and the bell', () => {
    const grade = ev({
      type: 'assignment.graded',
      assignmentId: 'hw-4-1',
      studentId: 'nermin',
      score: 9,
      outOf: 10,
    });
    const list = answer('/v1/teacher/assignments', teacherAssignmentSchema.array().parse, [
      grade,
    ]).map((a) => assignmentOf(contents, a));
    expect(list.find((a) => a.id === 'hw-4-1')?.toGrade).toBe(5);
    const notices = noticesOf(
      answer('/v1/teacher/notifications', notificationSchema.array().parse, [grade]),
      answer('/v1/teacher/inbox', askQuestionViewSchema.array().parse, [grade]),
      list,
    );
    expect(notices.find((n) => n.kind === 'homework')).toMatchObject({ count: 5, topic: '4.1' });
  });

  it('shows q-nermin-1 with the AI draft until Lalə answers it', () => {
    const before = inboxQuestionOf(
      answer('/v1/teacher/inbox/q-nermin-1', askQuestionViewSchema.parse),
    );
    expect([before.approved, before.aiStatus, before.steps.length]).toEqual([false, 'ready', 3]);
    expect(before.topic?.number).toBe('4.3');
    const answered = ev({ type: 'ask.answered', questionId: 'q-nermin-1', teacherId: 'lale' });
    const after = inboxQuestionOf(
      answer('/v1/teacher/inbox/q-nermin-1', askQuestionViewSchema.parse, [answered]),
    );
    expect([after.approved, after.steps.length]).toEqual([true, 3]);
  });

  it('names the student of a new question in the bell', () => {
    const question = answer('/v1/ask/questions/q-nermin-1', askQuestionViewSchema.parse);
    const sent = ev({
      type: 'ask.sent',
      question: { ...question, id: 'q-nermin-new', status: 'sent', answer: null },
    });
    const notices = noticesOf(
      answer('/v1/teacher/notifications', notificationSchema.array().parse, [sent]),
      answer('/v1/teacher/inbox', askQuestionViewSchema.array().parse, [sent]),
      [],
    );
    expect(notices.filter((n) => n.kind === 'question').map((n) => n.read)).toContain(false);
    expect(notices.find((n) => n.id === `n-${sent.id}`)).toMatchObject({
      kind: 'question',
      name: 'Nərmin Əliyeva',
    });
  });

  it('puts Lalə on her own tile and names the raised hands in the live room', () => {
    const [lesson] = answer('/v1/teacher/live', liveLessonSchema.array().parse);
    const roster = answer('/v1/teacher/classes/7b', teacherClassDetailSchema.parse).members;
    if (!lesson) throw new Error('no live lesson');
    const room = liveRoomOf(contents, lesson, roster, 'lale');
    expect(room.participants[0]).toMatchObject({ id: 'lale', state: 'me' });
    expect(room.hands.map((h) => h.name)).toEqual(['Orxan Məmmədov', 'Aysel Quliyeva']);
    expect([room.total, room.topic?.number]).toEqual([24, '4.2']);
  });

  it('starts the test builder from a draft or from Vızı’s picks', () => {
    const materials = answer('/v1/teacher/materials', materialSchema.array().parse);
    const bank = answer('/v1/teacher/bank', bankQuestionSchema.array().parse);
    const unit = currentUnit(contents, assignments());
    expect(testStartOf(undefined, materials, bank, unit)).toEqual({
      title: null,
      topicId: 'riyaziyyat-7-4-1',
      questionIds: ['b-4-1-1', 'b-4-1-2', 'b-4-2-1', 'b-4-2-2'],
    });
    expect(testStartOf('mat-4-2-boost', materials, bank, unit)).toMatchObject({
      topicId: 'riyaziyyat-7-4-2',
      questionIds: ['b-4-2-1', 'b-4-2-2', 'b-4-2-3'],
    });
    const video = materials.find((m) => m.id === 'mat-kub-misal');
    expect(video && materialSize(video)).toBe(7);
  });

  it('reads the class report for unit 4', () => {
    const insights = insightsOf(
      contents,
      answer('/v1/teacher/insights/7b', classInsightsSchema.parse),
    );
    expect(insights.unitNumber).toBe('4');
    expect(insights.rows.length + insights.hiddenCount).toBe(24);
  });
});
