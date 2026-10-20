import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { LessonFlow } from '@/components/study/LessonFlow';
import { EmptyState, ErrorState, LoadingState, Screen, ScreenHeader } from '@/components/ui';
import { stepIndexOf } from '@/features/study/lessons';
import { useLesson } from '@/features/study/queries';

export default function LessonScreen() {
  const { t } = useTranslation();
  const { id, step } = useLocalSearchParams<{ id: string; step?: string }>();
  const query = useLesson(id);

  if (query.isPending)
    return (
      <Screen>
        <LoadingState />
      </Screen>
    );
  if (query.isError)
    return (
      <Screen>
        <ErrorState onRetry={() => void query.refetch()} />
      </Screen>
    );
  if (!query.data)
    return (
      <Screen>
        <ScreenHeader title={t('study.lesson.notFoundTitle')} />
        <EmptyState
          moment="aiThinking"
          title={t('study.lesson.notFoundTitle')}
          description={t('study.lesson.notFoundBody')}
          actionLabel={t('study.lesson.backToLearn')}
          onAction={() => router.navigate('/learn')}
        />
      </Screen>
    );

  return <LessonFlow lesson={query.data} step={stepIndexOf(step, query.data.steps)} />;
}
