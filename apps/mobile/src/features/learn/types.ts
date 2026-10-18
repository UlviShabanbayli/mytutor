import type { CellState } from '@/components/ui';

/*
 * View types of the learn area (subjects, the hive box, topics, placement). They describe what
 * the screens need from the demo data; the real schemas come with the curriculum, progress and
 * placement APIs (architecture Ş3: /v1/curricula/:id, /v1/topics/:id, /v1/me/progress,
 * /v1/me/placement) and will live in packages/schemas.
 */

/** A topic's mastery level: the ADR 0001 statuses plus `reinforced` (design: the five cells). */
export type MasteryLevel = CellState;

/** One of the four steps inside a topic: lesson, worked examples, practice, topic test. */
export type StepKind = 'lesson' | 'examples' | 'practice' | 'test';

export type StepState = 'done' | 'current' | 'todo';

export type TopicStep = {
  kind: StepKind;
  state: StepState;
  /** Examples and practice: how many there are and how many are done. */
  total?: number;
  done?: number;
  /** Estimated minutes for the whole step. */
  minutes?: number;
};

/** A teacher's own material attached to a topic for their class (shown with the name). */
export type TeacherMaterial = {
  id: string;
  teacher: string;
  /** The short form used in "Lalə müəllim". */
  teacherShort: string;
  className: string;
  title: string;
  duration: string;
  addedDaysAgo: number;
};

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

/** The unit test ("ana arı hüceyrəsi"): its level and, once taken, the result. */
export type UnitTest = {
  level: MasteryLevel;
  result?: { correct: number; total: number; points: number; badge?: string };
};

export type HiveUnit = {
  id: string;
  number: string;
  title: string;
  topics: HiveTopic[];
  unitTest: UnitTest;
};

/** A textbook edition a curriculum can follow; only ready ones have topics. */
export type Textbook = {
  id: string;
  name: string;
  /** Number of volumes ("2 hissə"); 1 for a whole-year book. */
  parts: number;
  ready: boolean;
  /** Volume that is ready, for "1-ci hissə hazırdır". */
  readyPart?: number;
  topicCount?: number;
};

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
  /** The topic the student continues with ("Sən buradasan"). */
  currentTopicId: string;
  /** Topics saved on the phone for offline use. */
  savedTopicIds: string[];
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

/** A short placement question written for the demo (never textbook or test-book text). */
export type PlacementQuestion = {
  id: string;
  unitId: string;
  topicId: string;
  prompt: string;
  options: string[];
  /** Index of the correct option. */
  answer: number;
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
