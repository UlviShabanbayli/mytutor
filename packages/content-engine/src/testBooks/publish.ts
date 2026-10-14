import { createHash } from 'node:crypto';
import { z } from 'zod';
import { SUBJECTS } from '@mytutor/schemas';
import type {
  AiCall,
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
import { callClaude, type CallSpec } from '../knowledge/claude';
import { formulasIn, mathSvg } from './mathSvg';
import { TEST_PARAPHRASE_SYSTEM, TEST_PARAPHRASE_VERSION } from './prompts';

/**
 * Questions of a test book as the app takes them: one test per subsection, the wording in our
 * own words (numbers and formulas untouched, checked by code), formulas typeset, figures
 * named for the API. A question is published only when all of that holds.
 */

/** A number as an answer the student can type: "36", "-4", "2,8". */
const NUMBER = /^-?\d+(?:[.,]\d+)?$/;

/** Why a question is left out of the app, for the report. */
export type Skip = 'type' | 'answer' | 'flagged' | 'paraphrase' | 'math';

/** Which questions the app can take now: choice ones with their option, open ones with a number. */
export function publishable(q: TestQuestion): Skip | null {
  if (q.flags.length) return 'flagged';
  if (q.type === 'choice') return q.options.length === 5 && q.answer?.choice ? null : 'answer';
  if (q.type === 'open') return q.answer && NUMBER.test(q.answer.printed.trim()) ? null : 'answer';
  return 'type';
}

/** Numbers written outside formulas, in order: a rewording must keep every one. */
const numbersIn = (text: string) => text.replace(/\$[^$]+\$/g, ' ').match(/\d+(?:[.,]\d+)?/g) ?? [];

const sameItems = (a: string[], b: string[]) =>
  a.length === b.length && [...a].sort().join('\u0000') === [...b].sort().join('\u0000');

/** True when `reworded` keeps every formula and number of `original`. */
export const keepsFacts = (original: string, reworded: string) =>
  sameItems(formulasIn(original), formulasIn(reworded)) &&
  sameItems(numbersIn(original), numbersIn(reworded));

const paraphraseSchema = z.object({
  questions: z.array(z.object({ id: z.string(), stem: z.string() })),
});

export function paraphraseSpec(questions: TestQuestion[]): CallSpec<typeof paraphraseSchema> {
  return {
    id: `test-paraphrase:${questions[0]?.id ?? ''}`,
    stage: 'test_paraphrase',
    model: 'claude-opus-5-5',
    effort: 'low',
    promptVersion: TEST_PARAPHRASE_VERSION,
    system: TEST_PARAPHRASE_SYSTEM,
    content: [
      {
        type: 'text',
        text: questions.map((q) => `QUESTION ${q.id}\n${q.stem}`).join('\n\n'),
      },
    ],
    schema: paraphraseSchema,
    blockIds: [],
  };
}

/** Stable ids from what a thing is: the same subsection is the same topic on every publish. */
const idOf = (prefix: string, ...parts: string[]) =>
  `${prefix}${createHash('sha1').update(parts.join('\u0000')).digest('hex').slice(0, 10)}`;

export type PublishInput = {
  book: TestBook;
  questions: TestQuestion[];
  client: Parameters<typeof callClaude>[0];
  cacheDir: string;
  /** Path the API serves a question's figure at, from the figure's file in the book folder. */
  figurePath: (file: string) => string;
  now?: () => Date;
};

export async function publishTests({
  book,
  questions,
  client,
  cacheDir,
  figurePath,
  now = () => new Date(),
}: PublishInput): Promise<{
  published: PublishedTests;
  skipped: Record<Skip, number>;
  calls: AiCall[];
}> {
  const skipped: Record<Skip, number> = { type: 0, answer: 0, flagged: 0, paraphrase: 0, math: 0 };
  const candidates = questions.filter((q) => {
    const why = publishable(q);
    if (why) skipped[why]++;
    return why === null;
  });

  // Reworded a subsection at a time, twenty at most per call.
  const calls: AiCall[] = [];
  const reworded = new Map<string, string>();
  const runs: TestQuestion[][] = [];
  for (const q of candidates) {
    const last = runs.at(-1);
    if (last && last.length < 20 && last[0]?.subsection === q.subsection) last.push(q);
    else runs.push([q]);
  }
  for (const run of runs) {
    const answer = await callClaude(client, paraphraseSpec(run), cacheDir);
    calls.push(answer.call);
    for (const r of answer.output.questions) reworded.set(r.id, r.stem.trim());
  }

  const math = new Map<string, MathSvg | null>();
  const typeset = async (latex: string) => {
    if (!math.has(latex)) math.set(latex, await mathSvg(latex));
    return math.get(latex) ?? null;
  };

  const subject = book.subject satisfies SubjectId;
  const topics: Topic[] = [];
  const tests: PracticeTest[] = [];
  for (const q of candidates) {
    const stem = reworded.get(q.id);
    if (!stem || !keepsFacts(q.stem, stem)) {
      skipped.paraphrase++;
      continue;
    }
    const formulas = [...formulasIn(stem), ...q.options.flatMap((o) => formulasIn(o.text))];
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
      stem,
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
    calls,
  };
}
