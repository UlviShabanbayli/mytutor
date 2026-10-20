import { useSyncExternalStore } from 'react';
import { onlineManager, useQuery } from '@tanstack/react-query';
import { testIdOf } from '@mytutor/demo-data';
import type { DemoPersona } from '@mytutor/types';
import { useStudyTest } from '@/features/study/queries';
import { useDemoPersona } from '@/lib/demoPersona';
import { fetchCurriculum, fetchHive, fetchPlacement } from './api';
import { gradeSubjects, subjectEntry } from './hiveView';
import { findTopic, findUnit, type TopicPlace, withState } from './mastery';
import { buildSearchIndex, type SearchIndex } from './search';
import { useLearnData, useLearnStore } from './store';
import type { Hive, HiveUnit, SubjectEntry } from './types';

/** The grade the learn tab opens on when the profile has none: the demo students' grade. */
export const DEFAULT_GRADE = 7;

const learnKeys = {
  grade: (persona: DemoPersona, grade: number) => ['learn', persona, 'grade', grade] as const,
  hive: (persona: DemoPersona, id: string) => ['learn', persona, 'hive', id] as const,
  placement: (persona: DemoPersona) => ['learn', persona, 'placement'] as const,
};

type Resolved = { hive: Hive } | { preparing: SubjectEntry | null };

/** A subject's hive box, or the subject while its textbook is prepared ("" = the student's own). */
async function resolveHive(persona: DemoPersona, id: string): Promise<Resolved> {
  const hive = await fetchHive(persona, id || undefined);
  if (hive) return { hive };
  return { preparing: subjectEntry(await fetchCurriculum(persona), id) };
}

async function fetchGrade(persona: DemoPersona, grade: number) {
  const { hiveId, preparing } = gradeSubjects(await fetchCurriculum(persona), grade);
  return { hive: hiveId ? await fetchHive(persona, hiveId) : null, preparing };
}

export type HiveView =
  | { status: 'pending' }
  | { status: 'error'; retry: () => void }
  | { status: 'preparing'; subject: SubjectEntry | null }
  | { status: 'ready'; hive: Hive };

/**
 * A subject's hive box with this device's progress on top (placement, current topic,
 * downloads). Without an id it is the student's own subject's.
 */
export function useHive(id?: string): HiveView {
  const persona = useDemoPersona();
  const query = useQuery({
    queryKey: learnKeys.hive(persona, id ?? ''),
    queryFn: () => resolveHive(persona, id ?? ''),
  });
  const hiveId = query.data && 'hive' in query.data ? query.data.hive.id : (id ?? '');
  const state = useLearnData((d) => d.hives[hiveId]);
  if (query.isPending) return { status: 'pending' };
  if (query.isError) return { status: 'error', retry: () => void query.refetch() };
  if ('preparing' in query.data) return { status: 'preparing', subject: query.data.preparing };
  return { status: 'ready', hive: withState(query.data.hive, state) };
}

/** The learn tab for one grade: its hive box (when the grade has one) and the rest. */
export function useGradeSubjects(grade: number) {
  const persona = useDemoPersona();
  const query = useQuery({
    queryKey: learnKeys.grade(persona, grade),
    queryFn: () => fetchGrade(persona, grade),
  });
  const state = useLearnData((d) => (query.data?.hive ? d.hives[query.data.hive.id] : undefined));
  const hive = query.data?.hive ? withState(query.data.hive, state) : null;
  return { query, hive, preparing: query.data?.preparing ?? [] };
}

/** A topic page, by topic id, in the student's hive. */
export function useTopic(
  id: string,
): Exclude<HiveView, { status: 'ready' }> | { status: 'ready'; hive: Hive; place: TopicPlace } {
  const view = useHive();
  if (view.status !== 'ready') return view;
  const place = findTopic(view.hive, id);
  return place ? { ...view, place } : { status: 'preparing', subject: null };
}

/** A unit (frame), by unit id, in the student's hive. */
export function useUnit(
  id: string,
):
  | Exclude<HiveView, { status: 'ready' }>
  | { status: 'ready'; hive: Hive; unit: HiveUnit; index: number } {
  const view = useHive();
  if (view.status !== 'ready') return view;
  const found = findUnit(view.hive, id);
  return found ? { ...view, ...found } : { status: 'preparing', subject: null };
}

/** The placement check's questions (the demo's own, for the ready hive's units). */
export function usePlacementQuestions() {
  const persona = useDemoPersona();
  return useQuery({
    queryKey: learnKeys.placement(persona),
    queryFn: () => fetchPlacement(persona),
  });
}

/** The search index over the hive (with this device's levels) and the checks' questions. */
export function useSearchIndex():
  Exclude<HiveView, { status: 'ready' }> | { status: 'ready'; hive: Hive; index: SearchIndex } {
  const view = useHive();
  const questions = usePlacementQuestions();
  if (view.status !== 'ready') return view;
  if (questions.isPending) return { status: 'pending' };
  if (questions.isError) return { status: 'error', retry: () => void questions.refetch() };
  return { status: 'ready', hive: view.hive, index: buildSearchIndex(view.hive, questions.data) };
}

/** A topic's or unit's test in the demo world ("test-<id>"); null while loading or without one. */
function useTestOf(id: string) {
  const query = useStudyTest(testIdOf(id));
  const data = query.data;
  return {
    test: data ? { id: data.test.id, questionCount: data.steps.length } : null,
    isPending: query.isPending,
  };
}

/** The topic test a topic's cell, page and "Bilirəm, keç" open. */
export const useTopicTest = (topicId: string) => useTestOf(topicId);

/** The unit test ("ana arı hüceyrəsi") of a frame. */
export const useUnitTest = (unitId: string) => useTestOf(unitId);

/** The student's last searches. */
export function useRecentSearches(): string[] {
  return useLearnStore((s) => s.recentSearches);
}

/** Whether the phone is online, as TanStack Query sees it (the browser's online events). */
export function useOnline(): boolean {
  return useSyncExternalStore(
    (onChange) => onlineManager.subscribe(onChange),
    () => onlineManager.isOnline(),
  );
}
