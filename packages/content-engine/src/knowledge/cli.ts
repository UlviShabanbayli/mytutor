#!/usr/bin/env tsx
// Usage: pnpm --filter @mytutor/content-engine knowledge <topic-dir> [--grade=N] [--dry-run] [--inline]
// <topic-dir> is the folder written by `textbook-parser source` (contains source.json and crops).
// Writes <topic-dir>/knowledge/knowledge.json and review.html; AI results are cached in
// <topic-dir>/knowledge/cache, so re-running costs nothing unless inputs or prompts change.
// --grade=N is the book's school grade: LaTeX from later grades is flagged (skipped without it).
// --dry-run makes no call: it lists the calls the cache cannot answer and estimates their cost.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { topicSourceSchema } from '@mytutor/schemas';
import { createClient, type ContentPart } from './claude';
import { buildDocument } from './document';
import { estimateTokens } from './estimate';
import { cropsFor, payloadFor } from './groups';
import { runKnowledgePipeline, uncachedCalls } from './pipeline';
import { costUsd } from './pricing';
import { EXTRACT_SYSTEM } from './prompts/extract.v2';
import { renderKnowledgeReview } from './reviewHtml';

const EXTRACT_MODEL = 'claude-opus-5-5';
const VERIFY_MODEL = 'claude-opus-5-5';
const ESTIMATE_CALIBRATION = 1.41;

async function main() {
  const args = process.argv.slice(2);
  const topicDir = resolve(args.find((a) => !a.startsWith('--')) ?? '');
  const sourceJson = await readFile(join(topicDir, 'source.json'), 'utf8');
  const source = topicSourceSchema.parse(JSON.parse(sourceJson));
  const outDir = join(topicDir, 'knowledge');
  const cacheDir = join(outDir, 'cache');
  const gradeArg = args.find((a) => a.startsWith('--grade='))?.slice('--grade='.length);
  const grade = gradeArg === undefined ? null : Number(gradeArg);
  if (grade !== null && !(Number.isInteger(grade) && grade >= 1 && grade <= 12))
    throw new Error(`--grade must be a school grade 1–12, got "${gradeArg}"`);

  if (args.includes('--dry-run')) {
    // Only calls without a cached result reach the API; those are what the estimate prices.
    const plan = await uncachedCalls(source, {
      topicDir,
      cacheDir,
      extractModel: EXTRACT_MODEL,
      verifyModel: VERIFY_MODEL,
    });
    let extractTokens = 0;
    let verifyTokens = 0;
    for (const { group: g, uncached } of plan) {
      const crops: ContentPart[] = [];
      for (const c of cropsFor(source, g)) {
        const png = await readFile(join(topicDir, c.path));
        crops.push({ type: 'image', png, sha256: createHash('sha256').update(png).digest('hex') });
      }
      const tokens = estimateTokens(
        [{ type: 'text', text: JSON.stringify(payloadFor(source, g)) }, ...crops],
        EXTRACT_SYSTEM,
      );
      if (uncached.includes('extract')) extractTokens += tokens;
      if (uncached.includes('verify')) verifyTokens += tokens;
      console.log(
        `${g.id}: ${g.blockIds.length} blok, ${crops.length} şəkil, ~${tokens} input token · ${uncached.length ? `yeni: ${uncached.join(', ')}` : 'cache'} · ${g.blockIds.join(',')}`,
      );
    }
    // Verification resends the crops with the claims; output ≈ 40% of input for extraction.
    const est = {
      input: extractTokens + verifyTokens,
      output: Math.round(extractTokens * 0.5),
      cacheWrite: 0,
      cacheRead: 0,
    };
    // The token estimate ran 1.41× low against real runs (part 1, 26 topics: $11.62 → $16.39).
    const calibrated = Math.round(costUsd(EXTRACT_MODEL, est) * ESTIMATE_CALIBRATION * 100) / 100;
    const fresh = plan.reduce((n, p) => n + p.uncached.length, 0);
    console.log(
      `Cəmi: ${fresh} yeni AI çağırışı (${plan.length} qrup), ~${est.input} input, ~${est.output} output token, ~$${calibrated} (real qaçışlarla kalibrləşdirilib)`,
    );
    return;
  }

  const client = createClient();
  const { results, calls } = await runKnowledgePipeline(source, {
    client,
    topicDir,
    cacheDir,
    extractModel: EXTRACT_MODEL,
    verifyModel: VERIFY_MODEL,
    log: (m) => console.log(m),
  });
  const doc = buildDocument(source, sourceJson, results, calls, grade);
  await mkdir(outDir, { recursive: true });
  await writeFile(join(outDir, 'knowledge.json'), `${JSON.stringify(doc, null, 2)}\n`);
  await writeFile(
    join(outDir, 'review.html'),
    await renderKnowledgeReview(doc, source, topicDir, { inline: args.includes('--inline') }),
  );

  const s = doc.summary;
  console.log(
    `\n${doc.items.length} element: textbook ${s.textbook}, derived ${s.derived}, unverified ${s.unverified}`,
  );
  console.log(`Şəkildən oxunan düsturlar: ${s.imageBasedFormulas.length}`);
  console.log(
    `Uğursuz yoxlamalı element: ${doc.items.filter((i) => i.checks.some((c) => c.result === 'fail')).length}; rədd edilən (sxemə uyğun deyil): ${s.rejected}`,
  );
  const fresh = calls.filter((c) => !c.cached);
  const sum = (
    list: typeof calls,
    k: 'inputTokens' | 'outputTokens' | 'cacheReadTokens' | 'cacheCreationTokens',
  ) => list.reduce((t, c) => t + c[k], 0);
  console.log(
    `AI çağırışları: ${calls.length} (yeni ${fresh.length}, cache ${calls.length - fresh.length}); input ${sum(calls, 'inputTokens')}, cache yazma ${sum(calls, 'cacheCreationTokens')}, cache oxuma ${sum(calls, 'cacheReadTokens')}, output ${sum(calls, 'outputTokens')} token`,
  );
  console.log(
    `Xərc: bütün nəticələr $${s.costUsd}; bu işə salmada $${Math.round(fresh.reduce((t, c) => t + c.costUsd, 0) * 10000) / 10000}`,
  );
  console.log(`Yazıldı: ${outDir}`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
