import { useQueries, useQuery } from '@tanstack/react-query';
import { testIdOf } from '@mytutor/demo-data';
import type { PracticeTest } from '@mytutor/types';
import { useTranslation } from 'react-i18next';
import { useSubjects } from '@/features/tests/queries';
import { useTestSessionStore } from '@/features/tests/sessionStore';
import { useDemoPersona } from '@/lib/demoPersona';
import { upperCase } from '@/lib/letterCase';
import { fetchCurriculum, fetchStudyTest, fetchWorldMistakes } from './api';
import { MISTAKES_TEST_ID, collectMistakes, groupMistakes, mergeMistakes } from './mistakes';
import { studyKeys } from './queries';
import type { MistakeGroup } from './types';

type MistakesView = {
  status: 'pending' | 'error' | 'ready';
  groups: MistakeGroup[];
  /** Where "Hamısını təkrarla" leads: the run of this device's mistakes, or a topic test. */
  repeatTestId: string | null;
  retry: () => void;
};

/**
 * "Səhvlərim": the student's mistakes in the demo world, with the wrong answers of the tests
 * finished on this device on top, by topic.
 */
export function useMistakes(): MistakesView {
  const persona = useDemoPersona();
  const results = useTestSessionStore((s) => s.results);
  const world = useQuery({
    queryKey: studyKeys.mistakes(persona),
    queryFn: () => fetchWorldMistakes(persona),
  });
  const ids = [...new Set(results.map((r) => r.testId))].filter((id) => id !== MISTAKES_TEST_ID);
  const tests = useQueries({
    queries: ids.map((id) => ({
      queryKey: studyKeys.test(persona, id),
      queryFn: () => fetchStudyTest(persona, id),
    })),
  });
  const retry = () => {
    void world.refetch();
    tests.forEach((q) => void q.refetch());
  };
  if (world.isPending || tests.some((q) => q.isPending))
    return { status: 'pending', groups: [], repeatTestId: null, retry };
  if (world.isError) return { status: 'error', groups: [], repeatTestId: null, retry };
  const byId: Record<string, PracticeTest> = Object.fromEntries(
    tests.flatMap((q) => (q.data ? [[q.data.test.id, q.data.test] as const] : [])),
  );
  const device = groupMistakes(collectMistakes(results, byId));
  const groups = mergeMistakes(device, world.data);
  const firstTopic = world.data[0]?.topicId;
  return {
    status: 'ready',
    groups,
    repeatTestId: device.length > 0 ? MISTAKES_TEST_ID : firstTopic ? testIdOf(firstTopic) : null,
    retry,
  };
}

/**
 * A subject's name for the mistakes filter: "Riyaziyyat 7" for a curriculum subject, a published
 * test book's title, or the id with a capital while neither has loaded.
 */
export function useSubjectTitles(): (subjectId: string) => string {
  const { t } = useTranslation();
  const persona = useDemoPersona();
  const curriculum = useQuery({
    queryKey: studyKeys.curriculum(persona),
    queryFn: () => fetchCurriculum(persona),
  });
  const published = useSubjects();
  return (id) => {
    const subject = curriculum.data?.subjects.find((s) => s.id === id);
    if (subject) return t('learn.hiveName', { subject: subject.name, grade: subject.grade });
    const book = published.data?.find((s) => s.id === id);
    return book?.title ?? upperCase(id.charAt(0), 'az') + id.slice(1);
  };
}
