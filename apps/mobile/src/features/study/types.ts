import type { MathSvg, PracticeTest, Question, SourceRef } from '@mytutor/types';
import type { CellState } from '@/components/ui';

// View types of the study area (lessons, test steps, review, mistakes). The real schemas come
// with the lessons, review and attempts APIs (architecture Ş4–Ş6, packages/schemas); until then
// these shapes describe the demo data and what the screens need.

/** The whiteboard video of a lesson. */
export type LessonVideo = {
  /** HLS or MP4 address; null while the video is still being prepared. */
  source: string | null;
  title: string;
  minutes: number;
  /** "Bu dərsdə": what the video covers, in two sentences. */
  summary: string;
  /** What the poster board shows: a heading and the key formula. */
  board: { heading: string; formula: string };
};

/** One page of the lesson text: paragraphs, the rule box, a closing line and a warning note. */
export type LessonPage = {
  heading: string;
  paragraphs: string[];
  rule: string[] | null;
  after: string | null;
  note: string | null;
  /** A ready question for Vızı ("niyə məhz 3?"), or null. */
  askVizi: string | null;
};

export type WorkedStep = { title: string; body: string };

/** A solved example, revealed one step at a time. */
export type WorkedExample = {
  number: number;
  problem: string;
  steps: WorkedStep[];
  hint: string;
  source: string;
};

/** An exercise whose typed answer is checked against the book's answer. */
export type LessonExercise = {
  number: number;
  prompt: string;
  expression: string;
  answer: string;
  /** Letters the formula keys offer next to ², ³, the signs and the brackets. */
  variables: string[];
  source: string;
};

export type StudyLesson = {
  id: string;
  /** Topic number in the textbook, e.g. "4.3". */
  topicCode: string;
  topicTitle: string;
  source: string;
  video: LessonVideo;
  pages: LessonPage[];
  example: WorkedExample;
  exercise: LessonExercise;
  /** Points ("bal damcısı") for finishing the lesson. */
  points: number;
  /** The topic test the lesson leads to. */
  testId: string;
};

/** Match each formula on the left with its partner on the right. */
export type MatchStep = {
  kind: 'match';
  id: string;
  prompt: string;
  left: string[];
  right: string[];
  /** For each left item, the index of its partner on the right. */
  pairs: number[];
  source: string;
};

/** A written solution sent as photos; a teacher (AI first, then the teacher) checks it. */
export type WrittenStep = {
  kind: 'written';
  id: string;
  prompt: string;
  source: string;
  reviewer: string;
};

/** One screen of a test session: an API question (choice or number) or a demo-only kind. */
export type SessionStep =
  { kind: 'question'; id: string; question: Question } | MatchStep | WrittenStep;

export type TestKind = 'topic' | 'mistakes' | 'demo';

export type StudyTest = {
  test: PracticeTest;
  steps: SessionStep[];
  kind: TestKind;
  /** Topic number shown with the test ("Mövzu testi · 4.3"), when known. */
  topicCode: string | null;
};

export type StepVerdict = 'correct' | 'wrong' | 'pending';

export type ReviewCell = { code: string; title: string };

/** Today's spaced review (demo until GET /v1/me/review). */
export type ReviewPlan = {
  due: ReviewCell[];
  questionCount: number;
  minutes: number;
  /** One topic's schedule, to explain how review works. */
  example: ReviewCell & { masteredDaysAgo: number; intervals: number[]; done: number };
  upcoming: { inDays: number; cells: string[] }[];
};

export type MistakeItem = {
  id: string;
  /** Question text; formulas between $…$ come from the group's `math`. */
  stem: string;
  yours: string;
  right: string;
  source: SourceRef | string;
  explanation: string | null;
  subjectId: string;
  finishedAt: string;
};

export type MistakeGroup = {
  id: string;
  title: string;
  cell: CellState;
  items: MistakeItem[];
  math: Record<string, MathSvg>;
};
