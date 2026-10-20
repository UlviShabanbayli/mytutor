import type { TextbookSummary, TopicMaterial, TopicStep, UnitTest } from '@mytutor/types';
import type { CellState } from '@/components/ui';

/*
 * View types of the learn area (subjects, the hive box, topics, placement): the demo world's
 * hive (`GET /v1/hive/:subjectId`) as the screens draw it, mapped in `hiveView.ts`. Shapes that
 * are the world's own come from @mytutor/types.
 */

export type { PlacementQuestion, TopicStep, UnitTest } from '@mytutor/types';

/** A topic's mastery level: the ADR 0001 statuses plus `reinforced` (design: the five cells). */
export type MasteryLevel = CellState;

/** One of the four steps inside a topic: lesson, worked examples, practice, topic test. */
export type StepKind = TopicStep['kind'];

export type StepState = TopicStep['state'];

/** A teacher's own material attached to a topic for their class (shown with the name). */
export type TeacherMaterial = TopicMaterial;

export type HiveTopic = {
  id: string;
  /** Number in the textbook, e.g. "4.3". */
  number: string;
  title: string;
  /** Start page in the textbook, when known. */
  page?: number;
  level: MasteryLevel;
  /** Ids of the topics this one builds on. */
  prerequisites: string[];
  steps: TopicStep[];
  material?: TeacherMaterial;
};

export type HiveUnit = {
  id: string;
  number: string;
  title: string;
  topics: HiveTopic[];
  unitTest: UnitTest;
};

/** A textbook edition a curriculum can follow; only ready ones have topics. */
export type Textbook = TextbookSummary;

/** One subject and grade: the hive box ("pətək qutusu") of its textbook. */
export type Hive = {
  id: string;
  subjectId: string;
  subjectName: string;
  grade: number;
  /** The textbook whose topics are shown, its volume, and the alternatives to pick from. */
  textbookId: string;
  part: number;
  textbooks: Textbook[];
  units: HiveUnit[];
  /** The topic the student continues with ("Sən buradasan"); null before the first lesson. */
  currentTopicId: string | null;
  /** Topics saved on the phone for offline use. */
  savedTopicIds: string[];
  /** Whether the student has begun this hive (a filled cell or a lesson begun). */
  started: boolean;
};

/** A subject tile on the learn tab: a hive box when ready, "Hazırlanır" otherwise. */
export type SubjectEntry = {
  id: string;
  name: string;
  /** Two letters in the subject's hexagon. */
  monogram: string;
  grade: number;
  hiveId?: string;
};

/** A placement answer; `null` is "Bilmirəm". */
export type PlacementAnswer = { questionId: string; choice: number | null };

export type PlacementOutcome = {
  answered: number;
  correct: number;
  /** Topics the check showed the student knows: they become Bal. */
  knownTopicIds: string[];
  /** Where to start; null when every topic is known. */
  startTopicId: string | null;
};
