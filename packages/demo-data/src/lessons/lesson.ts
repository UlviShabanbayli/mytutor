import type { StudyLesson } from '@mytutor/types';
import { demoSource, readyTopic } from '../curriculum';
import { testIdOf } from '../ids';

/** What a demo lesson's author writes; ids, titles, sources and the test follow from the topic. */
export type LessonDraft = Pick<StudyLesson, 'video' | 'pages'> & {
  example: Omit<StudyLesson['example'], 'source'>;
  exercise: Omit<StudyLesson['exercise'], 'source'>;
};

/** Points ("bal damcısı") for finishing a lesson. */
export const LESSON_POINTS = 15;

export function lesson(topicId: string, draft: LessonDraft): StudyLesson {
  const topic = readyTopic(topicId);
  return {
    id: topic.id,
    topicCode: topic.number,
    topicTitle: topic.shortTitle,
    source: demoSource(topic.id, 'demo dərs'),
    video: draft.video,
    pages: draft.pages,
    example: { ...draft.example, source: demoSource(topic.id, 'demo nümunə') },
    exercise: { ...draft.exercise, source: demoSource(topic.id, 'demo çalışma') },
    points: LESSON_POINTS,
    testId: testIdOf(topic.id),
  };
}
