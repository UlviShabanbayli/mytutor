import { useSyncExternalStore } from 'react';
import { onlineManager, useQuery } from '@tanstack/react-query';
import { useSubject } from '@/features/tests/queries';
import {
  DEMO_GRADE,
  DEMO_HIVE_ID,
  demoHive,
  demoPlacementQuestions,
  demoPreparingSubjects,
  demoRecentSearches,
  demoUnitResults,
} from './demo';
import { allTopics, findTopic, findUnit, type TopicPlace, withState } from './mastery';
import { pickRealTest } from './realTest';
import { buildSearchIndex, type SearchIndex } from './search';
import { useLearnStore } from './store';
import type { Hive, HiveUnit, SubjectEntry } from './types';

/*
 * Demo data until the curriculum, progress and placement APIs exist (architecture Ş3): the
 * hooks already have the shape the API calls will have, so screens do not change then.
 */

/** The grade the learn tab opens on when the profile has none. */
export const DEFAULT_GRADE = DEMO_GRADE;
/** The hive a screen shows when a link names none. */
export const DEFAULT_HIVE_ID = DEMO_HIVE_ID;

const learnKeys = {
  grade: (grade: number) => ['learn', 'grade', grade] as const,
  hive: (id: string) => ['learn', 'hive', id] as const,
  placement: (hiveId: string) => ['learn', 'placement', hiveId] as const,
};

type Resolved = { hive: Hive } | { preparing: SubjectEntry | null };

/** A hive id, or a subject id (the tests API's "riyaziyyat") for that subject's demo hive. */
async function fetchHive(id: string): Promise<Resolved> {
  if (id === DEMO_HIVE_ID || id === demoHive.subjectId) return { hive: demoHive };
  return { preparing: demoPreparingSubjects.find((s) => s.id === id) ?? null };
}

async function fetchGrade(grade: number) {
  return grade === DEMO_GRADE
    ? { hive: demoHive, preparing: demoPreparingSubjects }
    : { hive: null, preparing: [] };
}

export type HiveView =
  | { status: 'pending' }
  | { status: 'error'; retry: () => void }
  | { status: 'preparing'; subject: SubjectEntry | null }
  | { status: 'ready'; hive: Hive };

/** The hive box with this device's progress on top (placement, current topic, downloads). */
export function useHive(id: string): HiveView {
  const query = useQuery({ queryKey: learnKeys.hive(id), queryFn: () => fetchHive(id) });
  const hiveId = query.data && 'hive' in query.data ? query.data.hive.id : id;
  const state = useLearnStore((s) => s.hives[hiveId]);
  if (query.isPending) return { status: 'pending' };
  if (query.isError) return { status: 'error', retry: () => void query.refetch() };
  if ('preparing' in query.data) return { status: 'preparing', subject: query.data.preparing };
  return { status: 'ready', hive: withState(query.data.hive, state) };
}

/** The learn tab for one grade: its hive box (when the grade has one) and the rest. */
export function useGradeSubjects(grade: number) {
  const query = useQuery({ queryKey: learnKeys.grade(grade), queryFn: () => fetchGrade(grade) });
  const state = useLearnStore((s) => (query.data?.hive ? s.hives[query.data.hive.id] : undefined));
  const hive = query.data?.hive ? withState(query.data.hive, state) : null;
  return { query, hive, preparing: query.data?.preparing ?? [] };
}

/** Topic pages are linked by topic id; the demo has one hive, so it is looked up there. */
export function useTopic(
  id: string,
): Exclude<HiveView, { status: 'ready' }> | { status: 'ready'; hive: Hive; place: TopicPlace } {
  const view = useHive(DEMO_HIVE_ID);
  if (view.status !== 'ready') return view;
  const place = findTopic(view.hive, id);
  return place ? { ...view, place } : { status: 'preparing', subject: null };
}

export function useUnit(
  id: string,
):
  | Exclude<HiveView, { status: 'ready' }>
  | { status: 'ready'; hive: Hive; unit: HiveUnit; index: number } {
  const view = useHive(DEMO_HIVE_ID);
  if (view.status !== 'ready') return view;
  const found = findUnit(view.hive, id);
  return found ? { ...view, ...found } : { status: 'preparing', subject: null };
}

/** The unit test result the test flow reports (demo values until it does). */
export const unitResultOf = (unitId: string) => demoUnitResults[unitId];

export function usePlacementQuestions(hiveId: string) {
  return useQuery({
    queryKey: learnKeys.placement(hiveId),
    queryFn: async () => (hiveId === DEMO_HIVE_ID ? demoPlacementQuestions : []),
  });
}

/** The search index over the hive (with this device's levels) and the checks' questions. */
export function useSearchIndex():
  Exclude<HiveView, { status: 'ready' }> | { status: 'ready'; hive: Hive; index: SearchIndex } {
  const view = useHive(DEMO_HIVE_ID);
  const questions = usePlacementQuestions(DEMO_HIVE_ID);
  if (view.status !== 'ready') return view;
  if (questions.isPending) return { status: 'pending' };
  if (questions.isError) return { status: 'error', retry: () => void questions.refetch() };
  return { status: 'ready', hive: view.hive, index: buildSearchIndex(view.hive, questions.data) };
}

/**
 * The real published test a demo topic or unit opens (see `pickRealTest`: a temporary mapping
 * by position until topics come from the curriculum API). Null while loading or when the
 * subject has no published test.
 */
export function useRealTest(hive: Hive, position: number) {
  const subject = useSubject(hive.subjectId);
  const test = subject.data ? pickRealTest(subject.data.topics, position) : null;
  return { test, isPending: subject.isPending };
}

/** The real test a unit test cell opens: numbered after the topics in the demo mapping. */
export function useUnitTest(hive: Hive, unitIndex: number) {
  return useRealTest(hive, allTopics(hive).length + unitIndex);
}

/** The student's last searches (the demo's until they search themselves). */
export function useRecentSearches(): string[] {
  return useLearnStore((s) => s.recentSearches) ?? demoRecentSearches;
}

/** Whether the phone is online, as TanStack Query sees it (the browser's online events). */
export function useOnline(): boolean {
  return useSyncExternalStore(
    (onChange) => onlineManager.subscribe(onChange),
    () => onlineManager.isOnline(),
  );
}
