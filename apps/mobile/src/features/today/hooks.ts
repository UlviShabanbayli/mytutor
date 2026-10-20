import { useEffect, useSyncExternalStore } from 'react';
import { onlineManager } from '@tanstack/react-query';
import { router, type Href } from 'expo-router';
import { useAppStore } from '@/features/app/appStore';
import { useStudyTest } from '@/features/study/queries';
import { streakDays, todayIndex, weekActivity } from '@/features/tests/progress';
import { useTestSessionStore } from '@/features/tests/sessionStore';
import { useDemoPersona } from '@/lib/demoPersona';
import { dayKey } from './dates';
import {
  COMEBACK_AFTER_DAYS,
  DEFAULT_GOAL_MINUTES,
  flightDayNumber,
  goalProgress,
  streakWeek,
  weekCells,
  type DayCell,
  type GoalProgress,
} from './goal';
import { unreadCount } from './inbox';
import { stepHref } from './plan';
import { useInbox, useMotivationData } from './queries';
import { useTodayStore } from './store';
import type { LessonPart, MotivationData, TodayData, UnfinishedLesson } from './types';

/** Connection state as TanStack Query sees it (browser events on the web). */
export function useOnline(): boolean {
  return useSyncExternalStore(
    (onChange) => onlineManager.subscribe(onChange),
    () => onlineManager.isOnline(),
  );
}

/** Whether the world's student has not begun anything: no honey, no lesson, no plan. */
export const isNewStudent = (today: TodayData) =>
  today.motivation.points.total === 0 && today.unfinishedLesson === null && today.plan.length === 0;

/**
 * The first day: a student the world knows as new ("Yeni şagird") who has neither taken the
 * first step nor finished a test on this device.
 */
export function useFirstDay(today: TodayData | undefined): boolean {
  const persona = useDemoPersona();
  const taken = useTodayStore((s) => s.firstStepTaken.includes(persona));
  const hasActivity = useTestSessionStore((s) => s.results.length > 0 || s.session !== null);
  return today !== undefined && isNewStudent(today) && !taken && !hasActivity;
}

/** Records the visit once the stored state is loaded; a long break opens the comeback sheet. */
export function useVisitTracking(hydrated: boolean): void {
  useEffect(() => {
    if (!hydrated) return;
    const away = useTodayStore.getState().visit(dayKey(new Date()));
    if (away >= COMEBACK_AFTER_DAYS) {
      router.push({ pathname: '/comeback', params: { days: String(away) } });
    }
  }, [hydrated]);
}

export type Motivation = {
  streak: number;
  points: number;
  progress: GoalProgress;
  week: DayCell[];
  /** Which flight day today becomes, for "bu gün 13-cü uçuş günün olacaq". */
  flightDay: number;
  data: MotivationData | undefined;
};

/**
 * The day's numbers: the world's streak, points and minutes, with the tests finished on this
 * device on top (a first-day student's streak and week are only those). The goal is the
 * student's own choice of 10, 20 or 30 minutes.
 */
export function useMotivation(firstDay: boolean): Motivation {
  const data = useMotivationData().data;
  const results = useTestSessionStore((s) => s.results);
  const own = useAppStore((s) => s.profile.dailyMinutes);
  const goal = own ?? data?.dailyMinutes ?? DEFAULT_GOAL_MINUTES;
  const now = new Date();
  const todayIdx = todayIndex(now);
  const device = weekActivity(results, now);
  const known = streakWeek(data?.streak ?? 0, todayIdx);
  const active = device.map((on, i) => on || (known[i] ?? false));
  const activeToday = device[todayIdx] === true;
  const streak = Math.max((data?.streak ?? 0) + (activeToday ? 1 : 0), streakDays(results, now));
  const progress = goalProgress(firstDay ? 0 : (data?.minutesToday ?? 0), goal);

  return {
    streak,
    points: firstDay ? 0 : (data?.points ?? 0),
    progress,
    week: weekCells(active, todayIdx, progress),
    flightDay: flightDayNumber(streak, activeToday),
    data,
  };
}

export type ContinueItem = {
  kind: 'lesson' | 'test';
  code: string | null;
  title: string;
  subject: string | null;
  part: LessonPart | null;
  done: number;
  total: number;
  href: Href;
};

/** "Davam et": a test left halfway (on this device) first, else the unfinished lesson. */
export function useContinueItem(lesson: UnfinishedLesson | null): ContinueItem | null {
  const session = useTestSessionStore((s) => s.session);
  const testId = session?.testId ?? '';
  const test = useStudyTest(testId, session !== null);

  if (session) {
    if (!test.data) return null;
    return {
      kind: 'test',
      code: test.data.topicCode,
      title: test.data.test.title,
      subject: null,
      part: null,
      // The current question counts as done once its answer has been checked.
      done: session.index + (session.checked ? 1 : 0),
      total: test.data.steps.length,
      href: stepHref('test', session.testId),
    };
  }
  if (!lesson) return null;
  return {
    kind: 'lesson',
    code: lesson.code,
    title: lesson.title,
    subject: lesson.subject,
    part: lesson.part,
    done: lesson.done,
    total: lesson.total,
    href: stepHref('lesson', lesson.lessonId),
  };
}

/** Unread notifications for the bell. */
export function useUnreadCount(): number {
  const items = useInbox().data;
  return items ? unreadCount(items) : 0;
}

/** Closes a moment screen (sheet or celebration) back to "Bu gün". */
export function leaveToToday(): void {
  if (router.canGoBack()) router.back();
  else router.replace('/today');
}
