#!/usr/bin/env tsx
// Usage: pnpm --filter @mytutor/content-engine test-keys <test-book-dir> [--concurrency 3]
// Links every question of questions.json to the textbook topics it needs, from the book's
// topics.json (admin `topicCatalogueCli` first): suggestions with a role, a confidence and a
// reason, and what the question needs beyond our textbooks. Calls are cached.
import { readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { testQuestionsDocumentSchema, topicCatalogueSchema } from '@mytutor/schemas';
import { createClient } from '../knowledge/claude';
import { keyQuestions } from './keys';
import { TEST_KEYS_VERSION } from './prompts';

async function main() {
  const args = process.argv.slice(2);
  const dir = resolve(args.find((a) => !a.startsWith('--') && /\//.test(a)) ?? '');
  const concurrency = args.includes('--concurrency')
    ? Number(args[args.indexOf('--concurrency') + 1])
    : 3;
  const catalogue = topicCatalogueSchema.parse(
    JSON.parse(await readFile(join(dir, 'topics.json'), 'utf8')),
  );
  const doc = testQuestionsDocumentSchema.parse(
    JSON.parse(await readFile(join(dir, 'questions.json'), 'utf8')),
  );
  const calls = await keyQuestions(catalogue, doc.questions, createClient(), join(dir, 'cache'), {
    concurrency,
    onBatch: (done, total) => console.log(`${done}/${total}`),
  });
  const updated = testQuestionsDocumentSchema.parse({
    ...doc,
    prompts: { ...doc.prompts, keys: TEST_KEYS_VERSION },
    aiCalls: [...doc.aiCalls, ...calls.filter((c) => !c.cached)],
    updatedAt: new Date().toISOString(),
  });
  await writeFile(join(dir, 'questions.json'), `${JSON.stringify(updated, null, 2)}\n`);
  const qs = updated.questions;
  const linked = qs.filter((q) => q.links.some((l) => l.role === 'required')).length;
  const uncovered = qs.filter((q) => q.uncovered).length;
  const cost = calls.filter((c) => !c.cached).reduce((sum, c) => sum + c.costUsd, 0);
  console.log(
    `${qs.length} sual: ${linked} sualın lazımi mövzusu var, ${uncovered} sual kitablarımızda ` +
      `olmayan bilik tələb edir · bu dəfə $${cost.toFixed(2)}`,
  );
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
