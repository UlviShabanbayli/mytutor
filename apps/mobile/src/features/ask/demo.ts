// Demo data until the ask and AI APIs exist (architecture Ş8, Ş9): the student's photo
// questions with their AI drafts and teacher answers, today's free-plan usage, the subjects a
// question can be filed under and the demo class teacher. Nothing here calls an AI: every
// "AI" text is scripted. Texts are our own short examples (simple, correct maths), never
// textbook or test-book content; page numbers are only the topics' start pages.
import type { TFunction } from 'i18next';
import type {
  AskQuestion,
  AskSubject,
  AskTopicRef,
  AskUsage,
  SimilarQuestion,
  SolutionStep,
} from './types';

/** Free plan: photo questions and Vızı messages per day (the server decides by plan, P4). */
export const DEMO_LIMITS = { photoPerDay: 3, chatPerDay: 6 } as const;

/** Photo questions the demo student has already sent today before opening the app. */
export const DEMO_PHOTO_USED_TODAY = 2;

/** Typical answer times shown to the student, in minutes. */
export const ANSWER_MINUTES = { teacher: 15, general: 30 } as const;

/** Demo student's class: 7B mathematics with Lalə müəllim (only maths has a class teacher). */
export const DEMO_CLASS_SUBJECT_ID = 'math';

export const DEMO_SUBJECT_IDS = [
  'math',
  'azLang',
  'english',
  'physics',
  'biology',
  'history',
  'chemistry',
  'geography',
] as const;

export type DemoSubjectId = (typeof DEMO_SUBJECT_IDS)[number];

export function demoSubjects(t: TFunction): AskSubject[] {
  return DEMO_SUBJECT_IDS.map((id) => ({ id, name: t(`ask.demo.subjects.${id}`) }));
}

/** Topic of the chat and of the demo student's current lesson (4.3, s. 90). */
export const CURRENT_TOPIC = { key: 'cube', number: '4.3', page: 90, minutes: 8 } as const;

type TopicKey = 'cube' | 'factor' | 'percent' | 'parallelogram' | 'trapezoid';

const TOPICS: Record<TopicKey, { number: string; page: number | null; minutes: number }> = {
  cube: { number: '4.3', page: 90, minutes: 8 },
  factor: { number: '4.5', page: null, minutes: 7 },
  percent: { number: '2.4', page: null, minutes: 6 },
  parallelogram: { number: '5.3', page: null, minutes: 6 },
  trapezoid: { number: '5.6', page: null, minutes: 7 },
};

/** Demo topic and lesson ids; the learn area's ids replace these when the content API lands. */
export const demoTopicId = (number: string) => `r7-${number}`;

export function demoTopic(t: TFunction, key: TopicKey): AskTopicRef {
  const topic = TOPICS[key];
  return {
    id: demoTopicId(topic.number),
    number: topic.number,
    title: t(`ask.demo.topics.${key}`),
    lessonId: demoTopicId(topic.number),
    lessonMinutes: topic.minutes,
  };
}

/** "Riyaziyyat 7 (TRİMS), 1-ci hissə · 4.3 · s. 90" (without the page when unknown). */
export function demoSource(t: TFunction, key: TopicKey): string {
  const topic = TOPICS[key];
  return topic.page === null
    ? t('ask.demo.sourceTopic', { topic: topic.number })
    : t('ask.demo.source', { topic: topic.number, page: topic.page });
}

const step = (text: string, formula: string): SolutionStep => ({ text, formula });

const minutesAgo = (now: Date, minutes: number) =>
  new Date(now.getTime() - minutes * 60_000).toISOString();

function similar(t: TFunction, key: TopicKey, texts: string[]): SimilarQuestion[] {
  return texts.map((text, i) => ({
    id: `${key}-similar-${i + 1}`,
    text,
    source: demoSource(t, key),
    topicId: demoTopicId(TOPICS[key].number),
  }));
}

/** The demo student's questions, newest first, relative to `now`. */
export function demoQuestions(t: TFunction, now: Date = new Date()): AskQuestion[] {
  const math7 = t('ask.demo.subjectLabel', { subject: t('ask.demo.subjects.math'), grade: 7 });
  const lala = t('ask.demo.teacherShort');
  const lalaFull = t('ask.demo.teacherFull');
  const day = 24 * 60;

  const cubeSteps = [
    step(t('ask.demo.cube.step1'), '(a + b)³ = a³ + 3a²b + 3ab² + b³'),
    step(t('ask.demo.cube.step2'), '(2x)³ + 3·(2x)²·3 + 3·2x·3² + 3³'),
    step(t('ask.demo.cube.step3'), '8x³ + 36x² + 54x + 27'),
  ];

  return [
    {
      id: 'q-cube',
      title: t('ask.demo.cube.title'),
      mark: '(2x+3)³',
      photoUri: null,
      subjectLabel: math7,
      queue: 'teacher',
      teacherName: lala,
      note: t('ask.demo.cube.note'),
      sentAt: minutesAgo(now, 14),
      aiSolvedAt: minutesAgo(now, 13),
      answeredAt: null,
      status: 'teacher_checking',
      aiDraft: { answer: '(2x + 3)³ = 8x³ + 36x² + 54x + 27', steps: cubeSteps },
      answer: null,
      source: demoSource(t, 'cube'),
      topic: demoTopic(t, 'cube'),
      similar: similar(t, 'cube', [t('ask.demo.cube.similar1'), t('ask.demo.cube.similar2')]),
    },
    {
      id: 'q-trapezoid',
      title: t('ask.demo.trapezoid.title'),
      mark: 'MN = ?',
      photoUri: null,
      subjectLabel: math7,
      queue: 'teacher',
      teacherName: lala,
      note: '',
      sentAt: minutesAgo(now, 180),
      aiSolvedAt: minutesAgo(now, 179),
      answeredAt: minutesAgo(now, 166),
      status: 'answered',
      aiDraft: null,
      answer: {
        steps: [
          step(t('ask.demo.trapezoid.step1'), 'MN = (a + b) / 2'),
          step(t('ask.demo.trapezoid.step2'), 'MN = (6 + 10) / 2'),
          step(t('ask.demo.trapezoid.step3'), 'MN = 8 sm'),
        ],
        teacherName: lalaFull,
        teacherNote: null,
        correctedAi: false,
      },
      source: demoSource(t, 'trapezoid'),
      topic: demoTopic(t, 'trapezoid'),
      similar: [],
    },
    {
      id: 'q-factor',
      title: t('ask.demo.factor.title'),
      mark: 'x²−9',
      photoUri: null,
      subjectLabel: math7,
      queue: 'teacher',
      teacherName: lala,
      note: '',
      sentAt: minutesAgo(now, day + 60),
      aiSolvedAt: minutesAgo(now, day + 59),
      answeredAt: minutesAgo(now, day + 46),
      status: 'answered',
      aiDraft: null,
      answer: {
        steps: [
          step(t('ask.demo.factor.step1'), 'x² − 9 = x² − 3²'),
          step(t('ask.demo.factor.step2'), 'a² − b² = (a − b)(a + b)'),
          step(t('ask.demo.factor.step3'), 'x² − 9 = (x − 3)(x + 3)'),
        ],
        teacherName: lalaFull,
        teacherNote: t('ask.demo.factor.teacherNote'),
        correctedAi: false,
      },
      source: demoSource(t, 'factor'),
      topic: demoTopic(t, 'factor'),
      similar: similar(t, 'factor', [t('ask.demo.factor.similar1'), t('ask.demo.factor.similar2')]),
    },
    {
      id: 'q-percent',
      title: t('ask.demo.percent.title'),
      mark: '1,1³',
      photoUri: null,
      subjectLabel: math7,
      queue: 'teacher',
      teacherName: lala,
      note: '',
      sentAt: minutesAgo(now, day + 200),
      aiSolvedAt: minutesAgo(now, day + 199),
      answeredAt: minutesAgo(now, day + 170),
      status: 'answered',
      aiDraft: null,
      answer: {
        steps: [
          step(t('ask.demo.percent.step1'), '1000 · 1,1 = 1100'),
          step(t('ask.demo.percent.step2'), '1000 · 1,1³ = 1000 · 1,331'),
          step(t('ask.demo.percent.step3'), '1331 manat'),
        ],
        teacherName: lalaFull,
        teacherNote: t('ask.demo.percent.teacherNote'),
        correctedAi: true,
      },
      source: demoSource(t, 'percent'),
      topic: demoTopic(t, 'percent'),
      similar: [],
    },
    {
      id: 'q-parallelogram',
      title: t('ask.demo.parallelogram.title'),
      mark: '∠A, ∠B',
      photoUri: null,
      subjectLabel: math7,
      queue: 'general',
      teacherName: null,
      note: '',
      sentAt: minutesAgo(now, 3 * day + 120),
      aiSolvedAt: minutesAgo(now, 3 * day + 119),
      answeredAt: minutesAgo(now, 3 * day + 90),
      status: 'answered',
      aiDraft: null,
      answer: {
        steps: [
          step(t('ask.demo.parallelogram.step1'), '∠C = ∠A = 70°'),
          step(t('ask.demo.parallelogram.step2'), '∠B = ∠D = 180° − 70° = 110°'),
          step(t('ask.demo.parallelogram.step3'), '70°, 110°, 70°, 110°'),
        ],
        teacherName: 'Rəşad Quliyev',
        teacherNote: null,
        correctedAi: false,
      },
      source: demoSource(t, 'parallelogram'),
      topic: demoTopic(t, 'parallelogram'),
      similar: [],
    },
  ];
}

/** Today's usage before anything sent from this device is counted. */
export function demoUsage(): AskUsage {
  return {
    photoUsed: DEMO_PHOTO_USED_TODAY,
    photoLimit: DEMO_LIMITS.photoPerDay,
    chatUsed: 0,
    chatLimit: DEMO_LIMITS.chatPerDay,
  };
}
