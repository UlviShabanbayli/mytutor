#!/usr/bin/env tsx
// Usage: pnpm --filter @mytutor/content-engine test-publish <test-book-dir>
// Publishes a test book's questions for the app: <content-root>/.published/tests/<subject>.json
// (what the API serves) and the figures under .published/media/. The wording is reworded by
// Claude and checked by code; calls are cached, so publishing again costs nothing.
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename, join, resolve } from 'node:path';
import {
  publishedTestsSchema,
  testBookSchema,
  testQuestionsDocumentSchema,
} from '@mytutor/schemas';
import { createClient } from '../knowledge/claude';
import { publishTests } from './publish';

async function main() {
  const dir = resolve(process.argv[2] ?? '');
  const root = resolve(dir, '..', '..');
  const book = testBookSchema.parse(
    JSON.parse(await readFile(join(dir, 'test-book.json'), 'utf8')),
  );
  const doc = testQuestionsDocumentSchema.parse(
    JSON.parse(await readFile(join(dir, 'questions.json'), 'utf8')),
  );
  const out = join(root, '.published');
  await mkdir(join(out, 'tests'), { recursive: true });
  await mkdir(join(out, 'media'), { recursive: true });
  const { published, skipped, calls } = await publishTests({
    book,
    questions: doc.questions,
    client: createClient(),
    cacheDir: join(dir, 'cache'),
    figurePath: (file) => `media/${basename(file)}`,
  });
  // Only the figures of published questions leave the book folder.
  for (const test of published.tests)
    for (const q of test.questions)
      for (const figure of q.figures)
        await copyFile(join(dir, 'figures', basename(figure)), join(out, figure));
  const file = join(out, 'tests', `${published.subject.id}.json`);
  await writeFile(file, `${JSON.stringify(publishedTestsSchema.parse(published))}\n`);
  const cost = calls.filter((c) => !c.cached).reduce((sum, c) => sum + c.costUsd, 0);
  console.log(
    `${published.subject.questionCount} sual, ${published.tests.length} test dərc olundu → ${file}\n` +
      `buraxılan: növü ${skipped.type}, cavabı ${skipped.answer}, işarəli ${skipped.flagged}, ` +
      `mətni yoxlamadan keçmədi ${skipped.paraphrase}, düsturu çevrilmədi ${skipped.math} · ` +
      `bu dəfə $${cost.toFixed(2)}`,
  );
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
