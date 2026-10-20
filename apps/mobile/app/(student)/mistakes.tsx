import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { MistakesView } from '@/components/study/MistakesView';
import { EmptyState, ErrorState, LoadingState, Screen, ScreenHeader } from '@/components/ui';
import { MISTAKES_TEST_ID } from '@/features/study/mistakes';
import { useMistakes, useSubjectTitles } from '@/features/study/mistakeQueries';
import { useResetMistakesRun } from '@/features/study/queries';

export default function MistakesScreen() {
  const { t } = useTranslation();
  const mistakes = useMistakes();
  const subjectTitle = useSubjectTitles();
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
  const subjectChips = ids.map((id) => ({ id, title: subjectTitle(id) }));
  const repeat = mistakes.repeatTestId;

  return (
    <MistakesView
      groups={mistakes.groups}
      subjects={subjectChips}
      onRepeat={
        repeat
          ? () => {
              if (repeat === MISTAKES_TEST_ID) resetMistakesRun();
              router.push({ pathname: '/test/[id]', params: { id: repeat } });
            }
          : null
      }
    />
  );
}
