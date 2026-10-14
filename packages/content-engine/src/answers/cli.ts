#!/usr/bin/env tsx
// Usage: pnpm --filter @mytutor/content-engine answers <book-dir>/answers [--dry-run]
// <book-dir>/answers is the folder written by `textbook-parser answers` (source.json + pages).
// Writes answers.json beside it; AI results are cached in answers/cache, so running again costs
// nothing unless the pages or prompts change. --dry-run makes no call and prices the run.
import { writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { answersDocumentSchema } from '@mytutor/schemas';
import { createClient } from '../knowledge/claude';
import { estimateAnswers, readAnswers } from './pipeline';

async function main() {
  const args = process.argv.slice(2);
  const dir = resolve(args.find((a) => !a.startsWith('--')) ?? '');
  const cacheDir = join(dir, 'cache');
  if (args.includes('--dry-run')) {
    const plan = await estimateAnswers(dir, cacheDir);
    console.log(
      `${plan.pages} səhifə, ${plan.calls} yeni çağırış, ~${plan.inputTokens} input token · ` +
        `təxmini xərc $${plan.costUsd.toFixed(2)}`,
    );
    return;
  }
  const client = createClient();
  const doc = answersDocumentSchema.parse(await readAnswers(dir, client, cacheDir));
  await writeFile(join(dir, 'answers.json'), `${JSON.stringify(doc, null, 2)}\n`);
  const { answers, verified, mismatch, costUsd } = doc.summary;
  console.log(
    `${answers} cavab: ${verified} yoxlanıb, ${mismatch} uyğunsuz, ` +
      `${answers - verified - mismatch} bir dəfə oxunub · $${costUsd.toFixed(2)}`,
  );
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
