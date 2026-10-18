import { useLocalSearchParams } from 'expo-router';
import { LessonDoneView } from '@/components/study/LessonDoneView';
import { ErrorState, LoadingState, Screen } from '@/components/ui';
import { DEMO_TEST_ID } from '@/features/study/demo';
import { useLesson, useStudyTest } from '@/features/study/queries';
import { useStudyStore } from '@/features/study/studyStore';

export default function LessonDoneScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const lesson = useLesson(id);
  const test = useStudyTest(lesson.data?.testId ?? DEMO_TEST_ID);
  const minutes = useStudyStore((s) => s.lessonMinutes[id] ?? null);

  if (lesson.isPending)
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
      questions={test.data?.steps.length ?? 0}
    />
  );
}
