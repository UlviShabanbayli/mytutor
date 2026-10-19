import { createHash } from 'node:crypto';
import { SUBJECTS } from '@mytutor/schemas';
import type {
  MathSvg,
  OptionKey,
  PracticeTest,
  PublishedTests,
  Question,
  SubjectId,
  TestBook,
  TestQuestion,
  Topic,
} from '@mytutor/types';
import { formulasIn, mathSvg } from './mathSvg';

/**
 * Questions of a test book as the app takes them: one test per subsection, the wording exactly
 * as the book prints it (test books are written and tried out by teachers, so questions are
 * used as they are), formulas typeset, figures named for the API. A question is published
 * only when all of that holds.
 */

/** A number as an answer the student can type: "36", "-4", "2,8". */
const NUMBER = /^-?\d+(?:[.,]\d+)?$/;

/** Why a question is left out of the app, for the report. */
export type Skip = 'type' | 'answer' | 'flagged' | 'math';

/** Which questions the app can take now: choice ones with their option, open ones with a number. */
export function publishable(q: TestQuestion): Skip | null {
  if (q.flags.length) return 'flagged';
  if (q.type === 'choice') return q.options.length === 5 && q.answer?.choice ? null : 'answer';
  if (q.type === 'open') return q.answer && NUMBER.test(q.answer.printed.trim()) ? null : 'answer';
  return 'type';
}

/** Stable ids from what a thing is: the same subsection is the same topic on every publish. */
const idOf = (prefix: string, ...parts: string[]) =>
  `${prefix}${createHash('sha1').update(parts.join('\u0000')).digest('hex').slice(0, 10)}`;

export type PublishInput = {
  book: TestBook;
  questions: TestQuestion[];
  /** Path the API serves a question's figure at, from the figure's file in the book folder. */
  figurePath: (file: string) => string;
  now?: () => Date;
};

export async function publishTests({
  book,
  questions,
  figurePath,
  now = () => new Date(),
}: PublishInput): Promise<{ published: PublishedTests; skipped: Record<Skip, number> }> {
  const skipped: Record<Skip, number> = { type: 0, answer: 0, flagged: 0, math: 0 };
  const candidates = questions.filter((q) => {
    const why = publishable(q);
    if (why) skipped[why]++;
    return why === null;
  });

  const math = new Map<string, MathSvg | null>();
  const typeset = async (latex: string) => {
    if (!math.has(latex)) math.set(latex, await mathSvg(latex));
    return math.get(latex) ?? null;
  };

  const subject = book.subject satisfies SubjectId;
  const topics: Topic[] = [];
  const tests: PracticeTest[] = [];
  for (const q of candidates) {
    const formulas = [...formulasIn(q.stem), ...q.options.flatMap((o) => formulasIn(o.text))];
    const svgs = await Promise.all(formulas.map(typeset));
    if (svgs.some((s) => s === null)) {
      skipped.math++;
      continue;
    }
    const topicId = idOf('t_', book.id, q.subsection);
    let test = tests.find((t) => t.id === topicId);
    if (!test) {
      test = {
        id: topicId,
        topicId,
        subjectId: subject,
        title: q.subsection,
        questions: [],
        math: {},
      };
      tests.push(test);
      topics.push({
        id: topicId,
        subjectId: subject,
        title: q.subsection,
        grade: null,
        questionCount: 0,
      });
    }
    formulas.forEach((latex, i) => {
      const svg = svgs[i];
      if (svg && test) test.math[latex] = svg;
    });
    const question: Question = {
      id: q.id,
      topicId,
      type: q.type === 'open' ? 'open' : 'choice',
      stem: q.stem.trim(),
      options:
        q.type === 'choice'
          ? q.options.map((o) => ({ key: o.key as OptionKey, text: o.text }))
          : [],
      correctKey: q.type === 'choice' ? (q.answer?.choice ?? null) : null,
      answer: q.type === 'open' ? (q.answer?.printed.trim() ?? null) : null,
      explanation: null,
      figures: q.figures.map(figurePath),
      source: {
        kind: 'test_bank',
        title: book.title,
        section: q.subsection,
        ...(q.pages[0]?.printedPage ? { page: q.pages[0].printedPage } : {}),
      },
    };
    test.questions.push(question);
  }
  for (const topic of topics)
    topic.questionCount = tests.find((t) => t.id === topic.id)?.questions.length ?? 0;
  const total = tests.reduce((sum, t) => sum + t.questions.length, 0);
  return {
    published: {
      schemaVersion: 1,
      subject: {
        id: subject,
        title: SUBJECTS[subject].title,
        icon: SUBJECTS[subject].icon,
        topicCount: topics.length,
        questionCount: total,
      },
      topics,
      tests,
      publishedAt: now().toISOString(),
    },
    skipped,
  };
}
