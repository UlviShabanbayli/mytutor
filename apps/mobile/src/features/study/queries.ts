import { useQueries, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import type { PracticeTest, TestResult } from '@mytutor/types';
import i18n from '@/i18n';
import { fetchTest } from '@/features/tests/api';
import { testKeys } from '@/features/tests/queries';
import { useTestSessionStore } from '@/features/tests/sessionStore';
import {
  DEMO_TEST_ID,
  demoLessons,
  demoMistakeGroups,
  demoReviewPlan,
  demoStudyTest,
} from './demo';
import { findLesson } from './lessons';
import { MISTAKES_TEST_ID, buildMistakesTest, collectMistakes, groupMistakes } from './mistakes';
import { studyTestOf } from './steps';
import type { MistakeGroup, StudyTest } from './types';

export const studyKeys = {
  lesson: (id: string) => ['study', 'lesson', id] as const,
  test: (id: string) => ['study', 'test', id] as const,
  review: ['study', 'review'] as const,
};

/** Tests the app builds itself rather than fetching: the demo and the mistakes run. */
const isLocalTest = (id: string) => id === DEMO_TEST_ID || id === MISTAKES_TEST_ID;

/** Demo lessons (architecture Ş4) until GET /v1/lessons/:id exists; null for an unknown id. */
export function useLesson(id: string) {
  return useQuery({
    queryKey: studyKeys.lesson(id),
    queryFn: async () => findLesson(demoLessons, id),
  });
}

/** Every test a finished result points to, by id: the demo locally, the rest from the API. */
async function testsOf(client: QueryClient, results: TestResult[]) {
  const ids = [...new Set(results.map((r) => r.testId))].filter((id) => !isLocalTest(id));
  const tests = await Promise.all(
    ids.map((id) =>
      client.fetchQuery({ queryKey: testKeys.test(id), queryFn: () => fetchTest(id) }),
    ),
  );
  return Object.fromEntries([demoStudyTest.test, ...tests].map((t) => [t.id, t]));
}

async function mistakesStudyTest(client: QueryClient, results: TestResult[]) {
  const entries = collectMistakes(results, await testsOf(client, results));
  const test = buildMistakesTest(entries, i18n.t('study.mistakes.testTitle'));
  return test ? { ...studyTestOf(test), kind: 'mistakes' as const } : null;
}

/**
 * A test session's content: an API test (its questions), the demo test (every step kind) or
 * the run of the student's mistakes. The mistakes run is a snapshot: the result screen shows
 * the same questions; "Hamısını təkrarla" drops it so the next run is built afresh.
 */
export function useStudyTest(id: string) {
  const client = useQueryClient();
  const local = isLocalTest(id);
  const api = useQuery({
    queryKey: testKeys.test(id),
    queryFn: () => fetchTest(id),
    select: studyTestOf,
    enabled: !local,
  });
  const own = useQuery<StudyTest | null>({
    queryKey: studyKeys.test(id),
    queryFn: () =>
      id === DEMO_TEST_ID
        ? Promise.resolve(demoStudyTest)
        : mistakesStudyTest(client, useTestSessionStore.getState().results),
    enabled: local,
    staleTime: Infinity,
  });
  return local ? own : api;
}

/** Forget the last mistakes run so the next one is built from the current mistakes. */
export function useResetMistakesRun() {
  const client = useQueryClient();
  const restart = useTestSessionStore((s) => s.restart);
  return () => {
    client.removeQueries({ queryKey: studyKeys.test(MISTAKES_TEST_ID) });
    restart(MISTAKES_TEST_ID);
  };
}

/** Today's spaced review (architecture Ş6): demo until GET /v1/me/review exists. */
export function useReviewPlan() {
  return useQuery({ queryKey: studyKeys.review, queryFn: async () => demoReviewPlan });
}

type MistakesView =
  | { status: 'pending' | 'error'; groups: MistakeGroup[]; isDemo: false; retry: () => void }
  | { status: 'ready'; groups: MistakeGroup[]; isDemo: boolean; retry: () => void };

/**
 * "Səhvlərim": the wrong answers of finished tests, by topic. Before the first finished test
 * the screen shows demo mistakes (marked as an example).
 */
export function useMistakes(): MistakesView {
  const results = useTestSessionStore((s) => s.results);
  const ids = [...new Set(results.map((r) => r.testId))].filter((id) => !isLocalTest(id));
  const queries = useQueries({
    queries: ids.map((id) => ({ queryKey: testKeys.test(id), queryFn: () => fetchTest(id) })),
  });
  const retry = () => queries.forEach((q) => void q.refetch());
  if (results.length === 0) {
    return { status: 'ready', groups: demoMistakeGroups(), isDemo: true, retry };
  }
  if (queries.some((q) => q.isPending))
    return { status: 'pending', groups: [], isDemo: false, retry };
  const tests: PracticeTest[] = queries.flatMap((q) => (q.data ? [q.data] : []));
  // Without any of the tests there is nothing to show; a partial set still shows what it can.
  if (ids.length > 0 && tests.length === 0) {
    return { status: 'error', groups: [], isDemo: false, retry };
  }
  const byId = Object.fromEntries([demoStudyTest.test, ...tests].map((t) => [t.id, t]));
  return {
    status: 'ready',
    groups: groupMistakes(collectMistakes(results, byId)),
    isDemo: false,
    retry,
  };
}
