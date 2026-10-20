import { useQuery } from '@tanstack/react-query';
import type { DemoPersona, TodayResponse } from '@mytutor/types';
import { useDemoPersona } from '@/lib/demoPersona';
import { fetchInbox, fetchToday } from './api';
import type { MotivationData } from './types';

export const todayKeys = {
  today: (persona: DemoPersona) => ['today', persona] as const,
  inbox: (persona: DemoPersona) => ['today', persona, 'inbox'] as const,
};

/** The day's numbers from the world's `motivation`. */
export function motivationOf(today: TodayResponse): MotivationData {
  const m = today.motivation;
  return {
    points: m.points.total,
    streak: m.streak,
    dailyMinutes: m.dailyMinutes,
    minutesToday: m.minutesToday,
    endedStreak: m.endedStreak,
    restartMinutes: m.restartMinutes,
    freezesThisWeek: m.freezesThisWeek,
    todayCells: m.todayCells,
    todayPoints: m.points.today,
    todayAccuracy: m.todayAccuracy,
  };
}

/** GET /v1/today: the plan, the unfinished lesson, due work, the first step and the numbers. */
export function useToday() {
  const persona = useDemoPersona();
  return useQuery({ queryKey: todayKeys.today(persona), queryFn: () => fetchToday(persona) });
}

export function useMotivationData() {
  const persona = useDemoPersona();
  return useQuery({
    queryKey: todayKeys.today(persona),
    queryFn: () => fetchToday(persona),
    select: motivationOf,
  });
}

/** What the "welcome back" sheet shows; null when nothing crystallized. */
export function useComeback() {
  const persona = useDemoPersona();
  return useQuery({
    queryKey: todayKeys.today(persona),
    queryFn: () => fetchToday(persona),
    select: (today: TodayResponse) => today.comeback,
  });
}

export function useInbox() {
  const persona = useDemoPersona();
  return useQuery({ queryKey: todayKeys.inbox(persona), queryFn: () => fetchInbox(persona) });
}
