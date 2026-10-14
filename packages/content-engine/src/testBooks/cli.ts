#!/usr/bin/env tsx
// Usage: pnpm --filter @mytutor/content-engine test-book <test-book-dir> [--pages 2-10,211]
//        [--dry-run] [--concurrency 4]
// Reads a test book's rendered pages (`textbook-parser test-pages` first) with Claude and
// assembles questions.json: questions with their type, text, options or items, answers from
// the book's key, and flags. Readings are kept in readings/ and calls are cached, so running
// again costs nothing; questions keep their ids. Crops: `textbook-parser test-crops` after.
import { randomBytes } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { testPagesSchema, testQuestionsDocumentSchema } from '@mytutor/schemas';
import type { TestQuestion, TestQuestionsDocument } from '@mytutor/types';
import { createClient } from '../knowledge/claude';
import { assemble, matchAnswers } from './assemble';
import { TEST_READ_VERSION } from './prompts';
import { estimateRead, loadReadings, readPages } from './read';

const newId = () => `q_${[...randomBytes(10)].map((b) => (b % 36).toString(36)).join('')}`;
const naturalKey = (q: Pick<TestQuestion, 'section' | 'subsection' | 'number'>) =>
  `${q.section}\u0000${q.subsection}\u0000${q.number}`;

function pageList(spec: string | undefined, all: number[]): number[] {
  if (!spec) return all;
  const wanted = new Set(
    spec.split(',').flatMap((part) => {
      const [from = 0, to = from] = part.split('-').map(Number);
      return Array.from({ length: to - from + 1 }, (_, i) => from + i);
    }),
  );
  return all.filter((p) => wanted.has(p));
}

async function main() {
  const args = process.argv.slice(2);
  const option = (name: string) => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined);
  const dir = resolve(
    args.find((a, i) => !a.startsWith('--') && !args[i - 1]?.startsWith('--')) ?? '',
  );
  const rendered = testPagesSchema.parse(
    JSON.parse(await readFile(join(dir, 'pages.json'), 'utf8')),
  );
  const all = rendered.pages.map((p) => p.page);
  const pages = pageList(option('--pages'), all);
  const layouts = rendered.pages.filter((p) => pages.includes(p.page));
  const cacheDir = join(dir, 'cache');

  if (args.includes('--dry-run')) {
    const plan = await estimateRead(dir, layouts, cacheDir);
    console.log(
      `${plan.pages} səhifə, ${plan.calls} yeni çağırış, ~${plan.inputTokens} input token · ` +
        `təxmini xərc $${plan.costUsd.toFixed(2)}`,
    );
    return;
  }

  const client = createClient();
  const calls = await readPages(dir, layouts, client, cacheDir, {
    concurrency: Number(option('--concurrency') ?? 4),
    onPage: (page) => console.log(`page ${page} read`),
  });

  // Everything read so far is assembled, not only this run's pages.
  const readings = await loadReadings(dir, rendered.pages);
  const { drafts, key } = assemble(
    readings,
    [...readings.keys()].sort((a, b) => a - b),
  );
  const unmatched = matchAnswers(drafts, key);
  const previous = await readFile(join(dir, 'questions.json'), 'utf8').then(
    (text) => testQuestionsDocumentSchema.parse(JSON.parse(text)),
    () => null,
  );
  const known = new Map(previous?.questions.map((q) => [naturalKey(q), q]) ?? []);
  const taken = new Set<string>();
  const questions: TestQuestion[] = drafts.map(
    ({ pages: parts, situationFigureBands: _s, ...d }) => {
      const before = known.get(naturalKey(d));
      let id = before && !taken.has(before.id) ? before.id : newId();
      while (taken.has(id)) id = newId();
      taken.add(id);
      return {
        ...d,
        id,
        flags: key.length && !d.answer ? [...d.flags, 'no_answer'] : d.flags,
        pages: parts.map(({ figureBands: _f, ...p }) => p),
        crops: before?.crops ?? [],
        figures: before?.figures ?? [],
        links: before?.links ?? [],
        uncovered: before?.uncovered ?? null,
      };
    },
  );
  const at = new Date().toISOString();
  const doc: TestQuestionsDocument = testQuestionsDocumentSchema.parse({
    schemaVersion: 1,
    testBookId: rendered.testBookId,
    prompts: { read: TEST_READ_VERSION, keys: previous?.prompts.keys ?? null },
    pages: [...readings.keys()].sort((a, b) => a - b),
    questions,
    unmatchedAnswers: unmatched,
    aiCalls: [...(previous?.aiCalls ?? []), ...calls.filter((c) => !c.cached)],
    createdAt: previous?.createdAt ?? at,
    updatedAt: at,
  });
  await writeFile(join(dir, 'questions.json'), `${JSON.stringify(doc, null, 2)}\n`);
  // Band ids per figure, for the crop step.
  await writeFile(
    join(dir, 'figure-bands.json'),
    `${JSON.stringify(
      Object.fromEntries(
        drafts.map((d, i) => [
          questions[i]?.id,
          {
            question: d.pages.map((p) => ({ page: p.page, bands: p.bands })),
            figures: [
              ...d.pages.map((p) => ({ page: p.page, bands: p.figureBands })),
              ...d.situationFigureBands,
            ],
          },
        ]),
      ),
    )}\n`,
  );

  const byType = (t: string) => questions.filter((q) => q.type === t).length;
  const cost = calls.filter((c) => !c.cached).reduce((sum, c) => sum + c.costUsd, 0);
  console.log(
    `${questions.length} sual (seçimli ${byType('choice')}, açıq ${byType('open')}, ` +
      `uyğunluq ${byType('matching')}, yazılı ${byType('written')}) · cavabı olan ` +
      `${questions.filter((q) => q.answer).length} · işarəli ${questions.filter((q) => q.flags.length).length} · ` +
      `cavab cədvəlində sualı tapılmayan ${unmatched.length} · bu dəfə $${cost.toFixed(2)}`,
  );
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
