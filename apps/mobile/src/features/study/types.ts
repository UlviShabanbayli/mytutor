import type {
  LessonExercise,
  LessonPage,
  LessonVideo,
  MathSvg,
  MistakeItem as WorldMistakeItem,
  SourceRef,
  WorkedExample,
} from '@mytutor/types';
import type { CellState } from '@/components/ui';

// The study area (lessons, test steps, review, mistakes) reads the demo world's shapes from
// @mytutor/types; the types here are only what the screens build on top of them.

export type {
  LessonExercise,
  LessonPage,
  LessonVideo,
  MatchStep,
  ReviewCell,
  ReviewPlan,
  SessionStep,
  StudyLesson,
  StudyTest,
  WorkedExample,
  WorkedStep,
  WrittenStep,
} from '@mytutor/types';

export type StepVerdict = 'correct' | 'wrong' | 'pending';

/** The steps a lesson screen can have, in order (architecture "Öyrənmə modeli"). */
export const LESSON_STEPS = ['video', 'text', 'example', 'exercise'] as const;
export type LessonStepName = (typeof LESSON_STEPS)[number];

/** One of the book's own answers to an exercise printed on the topic's pages. */
export type BookAnswerRow = {
  id: string;
  /** "17" as printed, with the sub-item letters in the text. */
  exercise: string;
  page: number;
  text: string;
};

/**
 * What the lesson screens show. The text is the book's approved lesson text when the local API
 * has the content folder, else the demo lesson's; the video, the worked example and the exercise
 * come from the demo lesson when the topic has one. A step without content is left out.
 */
export type LessonView = {
  /** The topic id. */
  id: string;
  topicCode: string;
  topicTitle: string;
  steps: LessonStepName[];
  video: LessonVideo | null;
  pages: LessonPage[];
  /** The text's source line: the book's, or the demo lesson's. */
  textSource: string;
  /** Whether the text is the book's approved lesson text. */
  fromBook: boolean;
  example: WorkedExample | null;
  exercise: LessonExercise | null;
  /** The source line of the video (the demo lesson's). */
  source: string;
  /** The book's answers to the exercises on the topic's pages, when the content folder has them. */
  bookAnswers: { source: string; items: BookAnswerRow[] } | null;
  /** Points for finishing; null when the demo has no lesson for the topic. */
  points: number | null;
  /** The topic test the lesson leads to ("test-<topicId>"). */
  testId: string;
};

/** A mistake as "Səhvlərim" shows it: one of the demo world's, or one from a finished test. */
export type MistakeItem = Omit<WorldMistakeItem, 'source'> & { source: SourceRef | string };

export type MistakeGroup = {
  id: string;
  /** The topic the group is about; null for a published test outside the curriculum. */
  topicId: string | null;
  title: string;
  cell: CellState;
  items: MistakeItem[];
  math: Record<string, MathSvg>;
};
