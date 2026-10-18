import { useEffect } from 'react';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStudyStore } from '@/features/study/studyStore';
import type { StudyLesson } from '@/features/study/types';
import { LessonExampleStep } from './LessonExampleStep';
import { LessonExerciseStep } from './LessonExerciseStep';
import { LessonHeader } from './LessonHeader';
import { LessonTextStep } from './LessonTextStep';
import { LessonVideoStep } from './LessonVideoStep';
import { leaveTo } from '@/features/study/leave';

type LessonFlowProps = {
  lesson: StudyLesson;
  /** 0-based step (video, text, example, exercise), from the route's `step` parameter. */
  step: number;
};

/** The four steps of a lesson; the step lives in the URL, so back and deep links work. */
export function LessonFlow({ lesson, step }: LessonFlowProps) {
  const startLesson = useStudyStore((s) => s.startLesson);
  const finishLesson = useStudyStore((s) => s.finishLesson);
  useEffect(() => {
    startLesson(lesson.id);
  }, [startLesson, lesson.id]);

  const go = (index: number) => router.setParams({ step: String(index + 1) });
  const finish = () => {
    finishLesson(lesson.id);
    router.replace({ pathname: '/lesson/[id]/done', params: { id: lesson.id } });
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-page">
      <LessonHeader step={step} onClose={() => leaveTo('/learn')} />
      {step === 0 ? <LessonVideoStep lesson={lesson} onNext={() => go(1)} /> : null}
      {step === 1 ? <LessonTextStep lesson={lesson} onNext={() => go(2)} /> : null}
      {step === 2 ? <LessonExampleStep lesson={lesson} onNext={() => go(3)} /> : null}
      {step === 3 ? (
        <LessonExerciseStep lesson={lesson} onSeeRule={() => go(1)} onNext={finish} />
      ) : null}
    </SafeAreaView>
  );
}
