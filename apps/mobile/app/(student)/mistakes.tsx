import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { MistakesView } from '@/components/study/MistakesView';
import { EmptyState, ErrorState, LoadingState, Screen, ScreenHeader } from '@/components/ui';
import { DEMO_TEST_ID } from '@/features/study/demo';
import { MISTAKES_TEST_ID } from '@/features/study/mistakes';
import { useMistakes, useResetMistakesRun } from '@/features/study/queries';
import { useSubjects } from '@/features/tests/queries';
import { upperCase } from '@/lib/letterCase';

export default function MistakesScreen() {
  const { t } = useTranslation();
  const mistakes = useMistakes();
  const subjects = useSubjects();
  const resetMistakesRun = useResetMistakesRun();

  if (mistakes.status !== 'ready' || mistakes.groups.length === 0)
    return (
      <Screen>
        <ScreenHeader title={t('study.mistakes.title')} />
        {mistakes.status === 'pending' ? <LoadingState /> : null}
        {mistakes.status === 'error' ? <ErrorState onRetry={mistakes.retry} /> : null}
        {mistakes.status === 'ready' ? (
          <EmptyState
            moment="correct"
            title={t('study.mistakes.emptyTitle')}
            description={t('study.mistakes.emptyBody')}
          />
        ) : null}
      </Screen>
    );

  const ids = [...new Set(mistakes.groups.flatMap((g) => g.items.map((i) => i.subjectId)))];
  const titles = new Map((subjects.data ?? []).map((s) => [s.id, s.title]));
  // Until the subjects load (or without the API), a subject id reads as its name: "riyaziyyat" → "Riyaziyyat".
  const subjectChips = ids.map((id) => ({
    id,
    title: titles.get(id) ?? upperCase(id.charAt(0), 'az') + id.slice(1),
  }));

  return (
    <MistakesView
      groups={mistakes.groups}
      subjects={subjectChips}
      isDemo={mistakes.isDemo}
      onRepeat={() => {
        if (mistakes.isDemo)
          return router.push({ pathname: '/test/[id]', params: { id: DEMO_TEST_ID } });
        resetMistakesRun();
        router.push({ pathname: '/test/[id]', params: { id: MISTAKES_TEST_ID } });
      }}
    />
  );
}
