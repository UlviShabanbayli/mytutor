import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { z } from 'zod';
import { answerPartSchema, answerSourceSchema, extractedAnswerSchema } from '@mytutor/schemas';
import type { AiCall, Answer, AnswerSource, AnswersDocument } from '@mytutor/types';
import { callClaude, readCached, type CallSpec, type ContentPart } from '../knowledge/claude';
import { estimateTokens } from '../knowledge/estimate';
import { costUsd } from '../knowledge/pricing';
import {
  ANSWERS_EXTRACT_SYSTEM,
  ANSWERS_EXTRACT_VERSION,
  ANSWERS_VERIFY_SYSTEM,
  ANSWERS_VERIFY_VERSION,
} from './prompts';

export const ANSWERS_MODEL = 'claude-opus-5-5';

export const extractOutputSchema = z.object({ answers: z.array(extractedAnswerSchema) });
export const verifyOutputSchema = z.object({
  verdicts: z.array(
    z.object({
      index: z.number().int().describe('Number of the answer in the ANSWERS list'),
      verdict: z.enum(['match', 'mismatch', 'not_found']),
      correction: z.array(answerPartSchema).nullable(),
    }),
  ),
  missing: z.array(extractedAnswerSchema),
});

type Page = AnswerSource['pages'][number];

async function pageImage(dir: string, page: Page): Promise<ContentPart> {
  const png = await readFile(join(dir, page.image));
  return { type: 'image', png, sha256: createHash('sha256').update(png).digest('hex') };
}

export function extractSpec(page: Page, image: ContentPart): CallSpec<typeof extractOutputSchema> {
  const text = [
    `ANSWER-KEY PAGE ${page.printedPage ?? page.page}`,
    'TEXT LAYER (reading aid, column order; fractions and powers come apart, trust the image)',
    ...page.lines.map((line) => line.text),
  ].join('\n');
  return {
    id: `answers-extract:${page.page}`,
    stage: 'answers_extract',
    model: ANSWERS_MODEL,
    effort: 'high',
    promptVersion: ANSWERS_EXTRACT_VERSION,
    system: ANSWERS_EXTRACT_SYSTEM,
    content: [image, { type: 'text', text }],
    schema: extractOutputSchema,
    blockIds: [],
  };
}

export function verifySpec(
  page: Page,
  image: ContentPart,
  answers: z.output<typeof extractedAnswerSchema>[],
): CallSpec<typeof verifyOutputSchema> {
  const text = [
    'ANSWERS',
    ...answers.map((answer, i) => `${i + 1}. ${JSON.stringify(answer)}`),
  ].join('\n');
  return {
    id: `answers-verify:${page.page}`,
    stage: 'answers_verify',
    model: ANSWERS_MODEL,
    effort: 'high',
    promptVersion: ANSWERS_VERIFY_VERSION,
    system: ANSWERS_VERIFY_SYSTEM,
    content: [image, { type: 'text', text }],
    schema: verifyOutputSchema,
    blockIds: [],
  };
}

/** Output tokens a page takes, thinking included: a generous guess for the estimate. */
const OUTPUT_PER_PAGE = 12000;

/** What reading the pages would cost; cached calls cost nothing. */
export async function estimateAnswers(dir: string, cacheDir: string) {
  const source = answerSourceSchema.parse(
    JSON.parse(await readFile(join(dir, 'source.json'), 'utf8')),
  );
  let input = 0;
  let calls = 0;
  for (const page of source.pages) {
    const spec = extractSpec(page, await pageImage(dir, page));
    if (await readCached(spec, cacheDir)) continue;
    // The verify call sends the same image with the answers: about the same input again.
    input += 2 * estimateTokens(spec.content, spec.system);
    calls += 2;
  }
  const usd = costUsd(ANSWERS_MODEL, {
    input,
    output: (calls / 2) * OUTPUT_PER_PAGE * 2,
    cacheWrite: 0,
    cacheRead: 0,
  });
  return { pages: source.pages.length, calls, inputTokens: input, costUsd: usd };
}

/** An answer as stored: numbered, with the page it is printed on and how the check went. */
function answerOf(
  answer: z.output<typeof extractedAnswerSchema>,
  page: Page,
  status: Answer['status'],
  correction: Answer['correction'],
): Omit<Answer, 'id'> {
  return {
    ...answer,
    sourcePage: page.page,
    sourcePrintedPage: page.printedPage,
    status,
    correction,
  };
}

/**
 * Reads every answer-key page with Claude, then checks the reading against the page in a
 * second call. An answer the check agrees with is "verified"; one it reads differently is a
 * "mismatch" with its correction; one only the check saw is "unverified".
 */
export async function readAnswers(
  dir: string,
  client: Parameters<typeof callClaude>[0],
  cacheDir: string,
  now = () => new Date(),
): Promise<AnswersDocument> {
  const source = answerSourceSchema.parse(
    JSON.parse(await readFile(join(dir, 'source.json'), 'utf8')),
  );
  const found: Omit<Answer, 'id'>[] = [];
  const aiCalls: AiCall[] = [];
  for (const page of source.pages) {
    const image = await pageImage(dir, page);
    const extracted = await callClaude(client, extractSpec(page, image), cacheDir);
    aiCalls.push(extracted.call);
    const answers = extracted.output.answers;
    const checked = await callClaude(client, verifySpec(page, image, answers), cacheDir);
    aiCalls.push(checked.call);
    const verdicts = new Map(checked.output.verdicts.map((v) => [v.index, v]));
    answers.forEach((answer, i) => {
      const verdict = verdicts.get(i + 1);
      if (verdict?.verdict === 'not_found') return;
      found.push(
        verdict?.verdict === 'match'
          ? answerOf(answer, page, 'verified', null)
          : answerOf(
              answer,
              page,
              verdict ? 'mismatch' : 'unverified',
              verdict?.correction ?? null,
            ),
      );
    });
    for (const answer of checked.output.missing)
      found.push(answerOf(answer, page, 'unverified', null));
  }
  const answers = found.map((a, i) => ({ ...a, id: `a${String(i + 1).padStart(3, '0')}` }));
  return {
    schemaVersion: 1,
    book: source.book,
    prompts: { extract: ANSWERS_EXTRACT_VERSION, verify: ANSWERS_VERIFY_VERSION },
    createdAt: now().toISOString(),
    answers,
    aiCalls,
    summary: {
      answers: answers.length,
      verified: answers.filter((a) => a.status === 'verified').length,
      mismatch: answers.filter((a) => a.status === 'mismatch').length,
      costUsd: Math.round(aiCalls.reduce((sum, c) => sum + c.costUsd, 0) * 10000) / 10000,
    },
  };
}
