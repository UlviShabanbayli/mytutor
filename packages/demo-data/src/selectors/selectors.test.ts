import { describe, expect, it } from 'vitest';
import { MOCK_QUESTIONS } from '../exam/questions';
import { buildDemoWorld } from '../world';
import { selectAskQuestion, selectAskQuestions } from './ask';
import { selectClasses } from './classes';
import { goalFromQuery, selectExam, selectLeaderboard } from './exam';
import { selectHive } from './learn';
import { selectLeague, selectMe } from './me';
import { selectChildReport, selectParentCode, selectParentHome, selectParentNotes } from './parent';
import { selectInbox, selectInsights, selectTeacherAssignments } from './teacher';
import { selectReview } from './study';
import { selectToday } from './today';

const NOW = new Date('2026-10-20T06:00:00.000Z');
const nermin = buildDemoWorld({ now: NOW, persona: 'nermin' });
const fresh = buildDemoWorld({ now: NOW, persona: 'fresh' });

describe('student selectors', () => {
  it('Today: review 2.2, the unfinished 4.3 lesson and the 4.2 test; the first step for a new student', () => {
    const today = selectToday(nermin);
    expect(today.plan.map((s) => `${s.kind}:${s.code}`)).toEqual([
      'review:2.2',
      'lesson:4.3',
      'assignment:4.2',
    ]);
    expect(today.assignments.map((a) => `${a.id}:${a.state}`)).toEqual([
      'hw-4-1:submitted',
      'quiz-4-2:not_started',
      'lesson-4-3:in_progress',
    ]);
    expect(today.motivation.points).toEqual({ total: 2140, week: 340, today: 45 });
    const first = selectToday(fresh);
    expect([first.plan, first.assignments, first.unfinishedLesson]).toEqual([[], [], null]);
    expect(first.firstStep.firstTopicId).toBe('riyaziyyat-7-1-1');
  });

  it('Learn: 17/26 filled with 4.3 current; units 1–3 taken; an empty hive for a new student', () => {
    const hive = selectHive(nermin);
    expect([hive?.filled, hive?.total, hive?.currentTopicId]).toEqual([17, 26, 'riyaziyyat-7-4-3']);
    expect(hive?.units.map((u) => u.unitTest.level)).toEqual([
      'reinforced',
      'reinforced',
      'reinforced',
      'not_started',
      'not_started',
    ]);
    const cube = hive?.units[3]?.topics[2];
    expect(cube?.material?.title).toBe('Kublar cəmi: lövhədə 3 misal');
    const empty = selectHive(fresh);
    expect([empty?.filled, empty?.currentTopicId, empty?.savedTopicIds]).toEqual([0, null, []]);
    expect(selectHive(nermin, 'fizika-7')).toBeNull();
  });

  it('Me and leagues: the same numbers, 2nd in 7B, 6th in the country', () => {
    const me = selectMe(nermin);
    expect([me?.honeyCells, me?.profile.rank, me?.unreadInClasses]).toEqual([17, 'worker', 3]);
    expect(selectLeague(nermin, 'class').place).toBe(2);
    expect(selectLeague(nermin, 'country').place).toBe(6);
    expect(selectClasses(fresh)).toEqual([]);
    expect(selectLeague(fresh, 'class').rows).toEqual([]);
  });

  it('Ask: q-nermin-1 is the student’s newest question and waits in Lalə’s inbox', () => {
    expect(selectAskQuestions(nermin)[0]?.id).toBe('q-nermin-1');
    const asked = selectAskQuestion(nermin, 'q-nermin-1');
    const inbox = selectInbox(nermin).find((q) => q.id === 'q-nermin-1');
    expect(inbox).toEqual(asked);
    expect(asked?.teacherName).toBe('Lalə müəllim');
    expect(selectAskQuestions(fresh)).toEqual([]);
  });
});

describe('exam', () => {
  it('starts with the school programme and nothing to show', () => {
    const exam = selectExam(nermin, goalFromQuery(nermin, {}));
    expect(exam.goal).toEqual({ kind: 'school' });
    expect([exam.readiness, exam.plan, exam.weakSpots, exam.mocks]).toEqual([[], null, null, []]);
  });

  it('derives readiness, plan, weak spots and mocks from mastery once a goal is chosen', () => {
    const exam = selectExam(nermin, goalFromQuery(nermin, { goal: 'graduation_9' }));
    expect(exam.readiness).toContainEqual({
      subject: 'math',
      ready: true,
      percent: 58,
      weakCount: 3,
    });
    expect(exam.plan?.today.map((s) => s.target)).toEqual([
      { kind: 'review' },
      { kind: 'lesson', id: 'riyaziyyat-7-4-3' },
      { kind: 'test', id: 'test-riyaziyyat-7-u4' },
      { kind: 'review' },
    ]);
    expect(exam.weakSpots?.spots.map((s) => s.topic)).toEqual(['4.5', '2.2', '3.1']);
    expect(exam.weakSpots?.spots[0]?.chain.map((l) => `${l.topic}${l.root ? '*' : ''}`)).toEqual([
      '4.5',
      '4.4',
      '4.3*',
    ]);
    const variant = exam.mocks.find((m) => m.id === 'variant-1');
    expect(variant && !variant.preparing && variant.lastPercent).toBe(64);
    expect(exam.mocks.filter((m) => m.preparing).map((m) => m.subject)).toEqual([
      'azLanguage',
      'foreignLanguage',
    ]);
    expect(selectLeaderboard(nermin, 'country')?.you.score).toBe(64);
  });

  it('gives a new student an exam plan from the first topic', () => {
    const exam = selectExam(fresh, { kind: 'exam', exam: 'admission', group: 'II', date: null });
    expect(exam.readiness.find((r) => r.subject === 'math')).toEqual({
      subject: 'math',
      ready: true,
      percent: 0,
      weakCount: 0,
    });
    expect(exam.plan?.today[0]?.target).toEqual({ kind: 'lesson', id: 'riyaziyyat-7-1-1' });
    expect(selectLeaderboard(fresh, 'country')).toBeNull();
  });

  it('has mock questions with five different options and the right one among them', () => {
    expect(MOCK_QUESTIONS).toHaveLength(25);
    for (const q of MOCK_QUESTIONS) {
      expect(new Set(q.options.map((o) => o.text)).size).toBe(5);
      expect(q.options.map((o) => o.key)).toContain(q.correctKey);
    }
  });
});

describe('teacher and parent', () => {
  it('counts hw-4-1 as 18 of 24 handed in, 6 to grade (Nərmin among them)', () => {
    const hw = selectTeacherAssignments(nermin).find((a) => a.id === 'hw-4-1');
    expect([hw?.done, hw?.total, hw?.toGrade]).toEqual([18, 24, 6]);
    const notice = nermin.notifications.find((n) => n.kind === 'homework');
    expect(notice?.kind === 'homework' && notice.count).toBe(6);
    const quiz = selectTeacherAssignments(nermin).find((a) => a.id === 'quiz-4-2');
    expect(quiz?.total).toBe(24);
  });

  it('shows insights only for students who share progress', () => {
    const insights = selectInsights(nermin, '7b');
    expect([insights?.rows.length, insights?.hiddenCount]).toEqual([19, 5]);
    expect(insights?.rows.find((r) => r.studentId === 'nermin')?.levels).toEqual([
      'mastered',
      'mastered',
      'lesson_completed',
      'not_started',
      'not_started',
    ]);
  });

  it('gives Səbinə Nərmin’s week and Elvin’s consent, nothing Nərmin keeps to herself', () => {
    const home = selectParentHome(nermin);
    expect(home?.children.map((c) => `${c.name}:${c.status}`)).toEqual([
      'Nərmin:active',
      'Elvin:awaiting_consent',
    ]);
    const report = selectChildReport(nermin, 'nermin', 0)?.report;
    expect([report?.minutes, report?.answers.correct, report?.examReadiness]).toEqual([
      130,
      52,
      null,
    ]);
    expect(report?.assignments).toEqual({ onTime: 3, total: 3 });
    expect(selectChildReport(nermin, 'elvin', 0)).toBeNull();
  });

  it('tells Səbinə which class and teacher Nərmin has, and Lalə’s notes to 7B only', () => {
    const nerminCard = selectParentHome(nermin)?.children[0];
    expect(nerminCard).toMatchObject({
      classId: '7b',
      className: '7B',
      classLabel: '7B · Riyaziyyat',
      teacherId: 'lale',
    });
    expect(selectParentNotes(nermin).map((n) => n.classId)).toEqual(['7b']);
  });

  it('reads the parent codes: K7Q42M works, M4T8QW has run out', () => {
    expect(selectParentCode(nermin, 'k7q42m')).toMatchObject({ childId: 'nermin', expired: false });
    expect(selectParentCode(nermin, 'M4T8QW')?.expired).toBe(true);
  });
});

describe('links between resources', () => {
  it('every plan step, assignment and lesson leads to something that exists', () => {
    const lessons = new Set(nermin.lessons.map((l) => l.id));
    const tests = new Set(nermin.tests.map((t) => t.test.id));
    for (const a of nermin.assignments) if (a.testId) expect(tests).toContain(a.testId);
    for (const l of nermin.lessons) expect(tests).toContain(l.testId);
    for (const step of selectToday(nermin).plan)
      if (step.kind === 'lesson') expect(lessons).toContain(step.targetId);
    for (const world of [nermin, fresh]) {
      const exam = selectExam(world, {
        kind: 'exam',
        exam: 'graduation_9',
        group: null,
        date: null,
      });
      for (const step of exam.plan?.today ?? []) {
        if (step.target.kind === 'test') expect(tests).toContain(step.target.id);
        if (step.target.kind === 'lesson' && world === nermin)
          expect(lessons).toContain(step.target.id);
      }
    }
  });
});

describe('review', () => {
  it('starts a real practice: the due topics’ questions, sources marked demo', () => {
    const review = selectReview(nermin);
    expect(review.testId).toBe('test-review');
    const test = nermin.tests.find((t) => t.test.id === review.testId);
    expect([test?.kind, test?.topicCode]).toEqual(['review', '2.2, 3.1']);
    expect(test?.test.questions.map((q) => q.topicId)).toEqual([
      'riyaziyyat-7-2-2',
      'riyaziyyat-7-2-2',
      'riyaziyyat-7-2-2',
      'riyaziyyat-7-3-1',
      'riyaziyyat-7-3-1',
      'riyaziyyat-7-3-1',
    ]);
    expect(review.questionCount).toBe(6);
    for (const q of test?.test.questions ?? []) expect(q.source.demo).toBe(true);
    expect(selectReview(fresh).testId).toBeNull();
    expect(fresh.tests.map((t) => t.test.id)).not.toContain('test-review');
  });

  it('has topic tests for the review topics with five different options', () => {
    for (const id of ['test-riyaziyyat-7-2-2', 'test-riyaziyyat-7-3-1']) {
      const test = nermin.tests.find((t) => t.test.id === id);
      expect(test?.test.questions).toHaveLength(3);
      for (const q of test?.test.questions ?? [])
        if (q.type === 'choice') expect(new Set(q.options.map((o) => o.text)).size).toBe(5);
    }
  });
});
