import { useLocalSearchParams } from 'expo-router';
import { LessonDoneView } from '@/components/study/LessonDoneView';
import { ErrorState, LoadingState, Screen } from '@/components/ui';
import { useLesson, useStudyTest } from '@/features/study/queries';
import { useStudyStore } from '@/features/study/studyStore';

export default function LessonDoneScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const lesson = useLesson(id);
  const testId = lesson.data?.testId ?? '';
  const test = useStudyTest(testId, testId !== '');
  const minutes = useStudyStore((s) => s.lessonMinutes[id] ?? null);

  if (lesson.isPending || (testId !== '' && test.isPending))
    return (
      <Screen>
        <LoadingState />
      </Screen>
    );
  if (lesson.isError || !lesson.data)
    return (
      <Screen>
        <ErrorState onRetry={() => void lesson.refetch()} />
      </Screen>
    );

  return (
    <LessonDoneView
      lesson={lesson.data}
      minutes={minutes}
      questions={test.data ? test.data.steps.length : null}
    />
  );
}
