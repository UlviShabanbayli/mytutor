import { describe, expect, it } from 'vitest';
import type { DemoWorld } from '@mytutor/types';
import { makeClock } from '../clock';
import { buildDemoWorld } from '../world';
import { selectAskUsage } from './ask';
import { selectClasses } from './classes';
import { selectExam } from './exam';
import { selectHive } from './learn';
import { selectLeague, selectMe, selectMyProgress } from './me';
import { selectNotifications } from './messages';
import { selectParentHome, selectChildProgress } from './parent';
import { selectReview } from './study';
import { selectTeacherAssignments, selectTeacherHome } from './teacher';
import { selectToday } from './today';

/**
 * One number, one state: whatever two selectors both say about the world must agree. Checked at
 * several moments, for both personas.
 */

const MOMENTS = [
  new Date('2026-10-20T06:00:00.000Z'),
  new Date('2026-10-19T20:30:00.000Z'),
  new Date('2026-10-25T17:00:00.000Z'),
];
const worlds = MOMENTS.flatMap((now) =>
  (['nermin', 'fresh'] as const).map((persona) => buildDemoWorld({ now, persona })),
);
const nermins = worlds.filter((w) => w.persona === 'nermin');

const notice = <K extends string>(w: DemoWorld, kind: K) =>
  selectNotifications(w, 'student').find((n) => n.kind === kind);

describe.each(nermins.map((w) => [w.now, w] as const))('Nərmin’s world at %s', (_, w) => {
  it('has one set of points and one place in the league', () => {
    const me = selectMe(w);
    const today = selectToday(w);
    expect(today.motivation.points).toEqual(me?.profile.points);
    const week = w.student.points.week;
    expect(w.members.find((m) => m.personId === w.student.personId)?.weekPoints).toBe(week);
    const country = selectLeague(w, 'country');
    expect(country.rows.find((r) => r.me)?.points).toBe(week);
    expect(country.place).toBe(me?.profile.league?.place);
    expect(country.rows.find((r) => r.me)?.place).toBe(country.place);
  });

  it('has a streak that its days, its shield and yesterday’s notice agree with', () => {
    const [thisWeek, lastWeek] = w.weekReports[w.student.personId] ?? [];
    const days = [...(lastWeek?.activeDays ?? []), ...(thisWeek?.activeDays ?? [])];
    // Count back from yesterday: active days, and one missed day a shield covered.
    let streak = 0;
    let frozen = 0;
    for (let i = days.length - 2; i >= 0; i--) {
      if (days[i]) streak += 1;
      else if (frozen < 1) {
        frozen += 1;
        streak += 1;
      } else break;
    }
    expect(streak).toBe(w.student.streak);
    expect(selectToday(w).motivation.freezesThisWeek).toBe(frozen);
    const n = notice(w, 'streak');
    expect(n?.kind === 'streak' && n.days).toBe(w.student.streak);
  });

  it('adds each week up from its days, today as Today says', () => {
    for (const week of w.weekReports[w.student.personId] ?? []) {
      expect(week.minutes).toBe(week.days.reduce((n, d) => n + d.minutes, 0));
      expect(week.answers).toEqual({
        correct: week.days.reduce((n, d) => n + d.correct, 0),
        total: week.days.reduce((n, d) => n + d.answered, 0),
      });
      expect(week.activeDays).toEqual(week.days.map((d) => d.minutes > 0));
      expect(week.days[0]?.date).toBe(week.weekStart);
    }
    const today = w.weekReports[w.student.personId]?.[0]?.days[6];
    expect(today?.minutes).toBe(w.activity.minutesToday);
    expect(Math.round(((today?.correct ?? 0) / (today?.answered ?? 1)) * 100)).toBe(
      w.activity.todayAccuracy,
    );
    expect(selectMyProgress(w).week).toEqual(w.weekReports[w.student.personId]?.[0]);
  });

  it('reports the same week everywhere', () => {
    const week = w.weekReports[w.student.personId]?.[0];
    const n = notice(w, 'weeklySummary');
    expect(n?.kind === 'weeklySummary' && [n.topics, n.accuracy]).toEqual([
      week?.newTopics.length,
      Math.round(((week?.answers.correct ?? 0) / (week?.answers.total ?? 1)) * 100),
    ]);
    const child = selectParentHome(w)?.children.find((c) => c.childId === w.student.personId);
    expect([child?.week?.minutes, child?.week?.newTopics]).toEqual([
      week?.minutes,
      week?.newTopics.length,
    ]);
    expect(child?.week?.lastActiveAt).toBe(w.activity.lastActiveAt);
  });

  it('has one review: Today, the notice and the review plan', () => {
    const review = selectReview(w);
    const n = notice(w, 'reviewDue');
    expect(n?.kind === 'reviewDue' && [n.cells, n.minutes]).toEqual([
      review.due.length,
      review.minutes,
    ]);
    const step = selectToday(w).plan.find((s) => s.kind === 'review');
    expect(step?.code).toBe(review.due[0]?.code);
  });

  it('has one mastery: hive, Me, the parent, the exam', () => {
    const hive = selectHive(w);
    const me = selectMe(w);
    expect(me?.honeyCells).toBe(hive?.filled);
    const levels = me?.textbooks.find((t) => t.status === 'ready')?.levels;
    const fromHive = hive?.units.flatMap((u) => u.topics.map((t) => t.level)) ?? [];
    for (const [level, count] of Object.entries(levels ?? {}))
      expect(fromHive.filter((l) => l === level)).toHaveLength(count);
    const parent = selectChildProgress(w, w.student.personId)?.[0];
    expect(parent?.units.flatMap((u) => u.topics.map((t) => t.level))).toEqual(fromHive);
    const exam = selectExam(w, { kind: 'exam', exam: 'graduation_9', group: null, date: null });
    const math = exam.readiness.find((r) => r.subject === 'math');
    expect(math?.ready && math.weakCount).toBe(exam.weakSpots?.spots.length);
  });

  it('has the unfinished lesson and its assignment in the same place', () => {
    const lesson = w.activity.unfinishedLesson;
    const assignment = w.assignments.find(
      (a) => a.kind === 'lesson' && a.topicId === lesson?.lessonId,
    );
    const mine = w.submissions.find(
      (s) => s.assignmentId === assignment?.id && s.studentId === w.student.personId,
    );
    expect(mine?.state).toBe('in_progress');
    expect(mine?.progress).toEqual({ done: lesson?.done, total: lesson?.total });
    const hive = selectHive(w);
    const topic = hive?.units.flatMap((u) => u.topics).find((t) => t.id === lesson?.lessonId);
    expect(topic?.level).toBe('lesson_completed');
    expect(selectToday(w).plan.find((s) => s.kind === 'lesson')?.targetId).toBe(lesson?.lessonId);
  });

  it('counts classes, rosters and homework the same for every role', () => {
    const [cls] = selectClasses(w);
    const teacher = selectTeacherHome(w)?.classes.find((c) => c.id === cls?.id);
    expect(cls?.students).toBe(teacher?.studentCount);
    const hw = selectTeacherAssignments(w).find((a) => a.id === 'hw-4-1');
    const homework = selectNotifications(w, 'teacher').find((n) => n.kind === 'homework');
    expect(homework?.kind === 'homework' && homework.count).toBe(hw?.toGrade);
    const unread = selectClasses(w).reduce((n, c) => n + c.unread, 0);
    expect(selectMe(w)?.unreadInClasses).toBe(unread);
  });

  it('keeps notices pointing at what happened, when it happened', () => {
    for (const n of selectNotifications(w, 'student')) {
      if (n.kind === 'answerReady') {
        const q = w.askQuestions.find((x) => x.id === n.questionId);
        expect(q?.status).toBe('answered');
        expect(q?.timeline.find((e) => e.event === 'answered')?.at).toBe(n.at);
      }
      if (n.kind === 'newAssignment')
        expect(w.assignments.find((a) => a.id === n.assignmentId)?.assignedAt).toBe(n.at);
    }
    for (const n of selectNotifications(w, 'teacher'))
      if (n.kind === 'question') {
        const q = w.askQuestions.find((x) => x.id === n.questionId);
        expect([q?.status, q?.timeline[0]?.at]).toEqual(['teacher_checking', n.at]);
      }
    for (const n of w.notifications) expect(n.at <= w.now).toBe(true);
  });
});

describe.each(worlds.map((w) => [`${w.persona} at ${w.now}`, w] as const))('%s', (_, w) => {
  it('counts today’s photo questions from the questions sent today', () => {
    const clock = makeClock(new Date(w.now));
    const today = w.askQuestions.filter(
      (q) =>
        q.studentId === w.student.personId &&
        q.timeline.some((e) => e.event === 'sent' && clock.daysUntil(e.at) === 0),
    );
    expect(selectAskUsage(w).photoUsed).toBe(Math.min(today.length, w.askUsage.photoLimit));
  });

  it('never dates a past event in the future', () => {
    for (const s of w.submissions) {
      if (s.submittedAt) expect(s.submittedAt <= w.now).toBe(true);
      if (s.gradedAt) expect(s.gradedAt <= w.now).toBe(true);
    }
    for (const m of w.messages) expect(m.at <= w.now).toBe(true);
    for (const q of w.askQuestions) for (const e of q.timeline) expect(e.at <= w.now).toBe(true);
  });
});
