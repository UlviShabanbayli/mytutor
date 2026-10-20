import { useEffect } from 'react';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { leaveTo } from '@/features/study/leave';
import { useStudyStore } from '@/features/study/studyStore';
import type { LessonView } from '@/features/study/types';
import { LessonExampleStep } from './LessonExampleStep';
import { LessonExerciseStep } from './LessonExerciseStep';
import { LessonHeader } from './LessonHeader';
import { LessonTextStep } from './LessonTextStep';
import { LessonVideoStep } from './LessonVideoStep';

type LessonFlowProps = {
  lesson: LessonView;
  /** 0-based index into the lesson's steps, from the route's `step` parameter. */
  step: number;
};

/**
 * The lesson's steps (video, text, example, exercise; a lesson made of the book's text alone has
 * only the text). The step lives in the URL, so back and deep links work.
 */
export function LessonFlow({ lesson, step }: LessonFlowProps) {
  const startLesson = useStudyStore((s) => s.startLesson);
  const finishLesson = useStudyStore((s) => s.finishLesson);
  useEffect(() => {
    startLesson(lesson.id);
  }, [startLesson, lesson.id]);

  const { steps } = lesson;
  const name = steps[step] ?? steps[0];
  const go = (index: number) => router.setParams({ step: String(index + 1) });
  const finish = () => {
    finishLesson(lesson.id);
    router.replace({ pathname: '/lesson/[id]/done', params: { id: lesson.id } });
  };
  const next = () => (step < steps.length - 1 ? go(step + 1) : finish());
  const textIndex = steps.indexOf('text');

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-page">
      <LessonHeader steps={steps} step={step} onClose={() => leaveTo('/learn')} />
      {name === 'video' && lesson.video ? (
        <LessonVideoStep lesson={lesson} video={lesson.video} onNext={next} />
      ) : null}
      {name === 'text' ? <LessonTextStep lesson={lesson} n={step + 1} onNext={next} /> : null}
      {name === 'example' && lesson.example ? (
        <LessonExampleStep example={lesson.example} onNext={next} />
      ) : null}
      {name === 'exercise' && lesson.exercise ? (
        <LessonExerciseStep
          exercise={lesson.exercise}
          onSeeRule={() => go(Math.max(0, textIndex))}
          onNext={next}
        />
      ) : null}
    </SafeAreaView>
  );
}
