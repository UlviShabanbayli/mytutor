import { useEffect, useSyncExternalStore } from 'react';
import { onlineManager, useQuery } from '@tanstack/react-query';
import { router, type Href } from 'expo-router';
import { useAppStore } from '@/features/app/appStore';
import { fetchTest } from '@/features/tests/api';
import { streakDays, todayIndex, weekActivity } from '@/features/tests/progress';
import { testKeys } from '@/features/tests/queries';
import { useTestSessionStore } from '@/features/tests/sessionStore';
import { dayKey } from './dates';
import {
  COMEBACK_AFTER_DAYS,
  DEFAULT_GOAL_MINUTES,
  flightDayNumber,
  goalProgress,
  weekCells,
  type DayCell,
  type GoalProgress,
} from './goal';
import { unreadCount } from './inbox';
import { stepHref } from './plan';
import { useInbox, useMotivationData } from './queries';
import { useTodayStore } from './store';
import type { LessonPart, MotivationData, UnfinishedLesson } from './types';

/** Connection state as TanStack Query sees it (browser events on the web). */
export function useOnline(): boolean {
  return useSyncExternalStore(
    (onChange) => onlineManager.subscribe(onChange),
    () => onlineManager.isOnline(),
  );
}

/** The first day of a guest who has not started anything yet. */
export function useFirstDay(): boolean {
  const firstDay = useTodayStore((s) => s.firstDay);
  const firstStepTaken = useTodayStore((s) => s.firstStepTaken);
  const hasActivity = useTestSessionStore((s) => s.results.length > 0 || s.session !== null);
  const today = dayKey(new Date());
  return !firstStepTaken && !hasActivity && (firstDay === null || firstDay === today);
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
 * Streak and week come from the student's real finished tests (on the device); points and
 * today's minutes from the demo until the motivation API counts them (P2). The goal is the
 * student's own choice of 10, 20 or 30 minutes.
 */
export function useMotivation(firstDay: boolean): Motivation {
  const data = useMotivationData().data;
  const results = useTestSessionStore((s) => s.results);
  const goal = useAppStore((s) => s.profile.dailyMinutes) ?? DEFAULT_GOAL_MINUTES;
  const now = new Date();
  const active = weekActivity(results, now);
  const todayIdx = todayIndex(now);
  const streak = streakDays(results, now);
  const progress = goalProgress(firstDay ? 0 : (data?.minutesToday ?? 0), goal);

  return {
    streak,
    points: firstDay ? 0 : (data?.points ?? 0),
    progress,
    week: weekCells(active, todayIdx, progress),
    flightDay: flightDayNumber(streak, active[todayIdx] === true),
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

/** "Davam et": a test left halfway (real session) first, else the unfinished lesson. */
export function useContinueItem(lesson: UnfinishedLesson | null): ContinueItem | null {
  const session = useTestSessionStore((s) => s.session);
  const testId = session?.testId ?? '';
  const test = useQuery({
    queryKey: testKeys.test(testId),
    queryFn: () => fetchTest(testId),
    enabled: session !== null,
  });

  if (session) {
    if (!test.data) return null;
    return {
      kind: 'test',
      code: null,
      title: test.data.title,
      subject: null,
      part: null,
      // The current question counts as done once its answer has been checked.
      done: session.index + (session.checked ? 1 : 0),
      total: test.data.questions.length,
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
  const readIds = useTodayStore((s) => s.readIds);
  return items ? unreadCount(items, readIds) : 0;
}

/** Closes a moment screen (sheet or celebration) back to "Bu gün". */
export function leaveToToday(): void {
  if (router.canGoBack()) router.back();
  else router.replace('/today');
}
