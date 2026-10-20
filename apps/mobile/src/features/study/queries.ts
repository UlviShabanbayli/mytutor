import { useQueries, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { testIdOf } from '@mytutor/demo-data';
import type { DemoPersona, ReviewPlan, TestResult } from '@mytutor/types';
import i18n from '@/i18n';
import { useTestSessionStore } from '@/features/tests/sessionStore';
import { useDemoPersona } from '@/lib/demoPersona';
import { fetchLesson, fetchReview, fetchStudyTest } from './api';
import { MISTAKES_TEST_ID, buildMistakesTest, collectMistakes } from './mistakes';
import { studyTestOf } from './steps';
import type { StudyTest } from './types';

export const studyKeys = {
  lesson: (persona: DemoPersona, id: string) => ['study', persona, 'lesson', id] as const,
  test: (persona: DemoPersona, id: string) => ['study', persona, 'test', id] as const,
  mistakesRun: (persona: DemoPersona) => ['study', persona, 'mistakes-run'] as const,
  review: (persona: DemoPersona) => ['study', persona, 'review'] as const,
  mistakes: (persona: DemoPersona) => ['study', persona, 'mistakes'] as const,
  curriculum: (persona: DemoPersona) => ['study', persona, 'curriculum'] as const,
};

/** A topic's lesson (book text first, then the demo lesson); null when it has neither. */
export function useLesson(id: string) {
  const persona = useDemoPersona();
  return useQuery({
    queryKey: studyKeys.lesson(persona, id),
    queryFn: () => fetchLesson(persona, id),
  });
}

/** The practice tests the finished results point to, by id (not the mistakes run itself). */
async function testsOf(client: QueryClient, persona: DemoPersona, results: TestResult[]) {
  const ids = [...new Set(results.map((r) => r.testId))].filter((id) => id !== MISTAKES_TEST_ID);
  const tests = await Promise.all(
    ids.map((id) =>
      client.fetchQuery({
        queryKey: studyKeys.test(persona, id),
        queryFn: () => fetchStudyTest(persona, id),
      }),
    ),
  );
  return Object.fromEntries(tests.flatMap((t) => (t ? [[t.test.id, t.test] as const] : [])));
}

async function mistakesStudyTest(client: QueryClient, persona: DemoPersona) {
  const results = useTestSessionStore.getState().results;
  const entries = collectMistakes(results, await testsOf(client, persona, results));
  const test = buildMistakesTest(entries, i18n.t('study.mistakes.testTitle'));
  return test ? { ...studyTestOf(test), kind: 'mistakes' as const } : null;
}

/**
 * A test session's content: a demo-world test, a published test, or the run of the student's
 * mistakes. The mistakes run is a snapshot: the result screen shows the same questions;
 * "Hamısını təkrarla" drops it so the next run is built afresh. Null for a test nobody has.
 */
export function useStudyTest(id: string, enabled = true) {
  const client = useQueryClient();
  const persona = useDemoPersona();
  const run = id === MISTAKES_TEST_ID;
  return useQuery<StudyTest | null>({
    queryKey: run ? studyKeys.mistakesRun(persona) : studyKeys.test(persona, id),
    queryFn: () => (run ? mistakesStudyTest(client, persona) : fetchStudyTest(persona, id)),
    enabled,
    // The run keeps its questions until it is dropped; a refetch would reshuffle it.
    staleTime: run ? Infinity : undefined,
  });
}

/** Forget the last mistakes run so the next one is built from the current mistakes. */
export function useResetMistakesRun() {
  const client = useQueryClient();
  const persona = useDemoPersona();
  const restart = useTestSessionStore((s) => s.restart);
  return () => {
    client.removeQueries({ queryKey: studyKeys.mistakesRun(persona) });
    restart(MISTAKES_TEST_ID);
  };
}

/** Today's spaced review (architecture Ş6), derived from the student's mastery. */
export function useReviewPlan() {
  const persona = useDemoPersona();
  return useQuery({ queryKey: studyKeys.review(persona), queryFn: () => fetchReview(persona) });
}

/**
 * Where today's review starts: the topic test of the first crystallized topic that has one, or
 * "Səhvlərim" (the mistakes of those topics) when none has a test. Pending while it looks.
 */
export function useReviewStart(plan: ReviewPlan): { pending: boolean; testId: string | null } {
  const persona = useDemoPersona();
  const ids = plan.due.map((cell) => testIdOf(cell.topicId));
  const tests = useQueries({
    queries: ids.map((id) => ({
      queryKey: studyKeys.test(persona, id),
      queryFn: () => fetchStudyTest(persona, id),
    })),
  });
  if (tests.some((q) => q.isPending)) return { pending: true, testId: null };
  return { pending: false, testId: tests.find((q) => q.data)?.data?.test.id ?? null };
}
