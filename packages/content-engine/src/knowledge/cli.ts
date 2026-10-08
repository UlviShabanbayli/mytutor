#!/usr/bin/env tsx
// Usage: pnpm --filter @mytutor/content-engine knowledge <topic-dir> [--dry-run] [--inline]
// <topic-dir> is the folder written by `textbook-parser source` (contains source.json and crops).
// Writes <topic-dir>/knowledge/knowledge.json and review.html; AI results are cached in
// <topic-dir>/knowledge/cache, so re-running costs nothing unless inputs or prompts change.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { topicSourceSchema } from '@mytutor/schemas';
import { createClient, type ContentPart } from './claude';
import { buildDocument } from './document';
import { estimateTokens } from './estimate';
import { cropsFor, groupBlocks, payloadFor } from './groups';
import { runKnowledgePipeline } from './pipeline';
import { costUsd } from './pricing';
import { EXTRACT_SYSTEM } from './prompts/extract.v2';
import { renderKnowledgeReview } from './reviewHtml';

const EXTRACT_MODEL = 'claude-opus-5-5';
const VERIFY_MODEL = 'claude-opus-5-5';

async function main() {
  const args = process.argv.slice(2);
  const topicDir = resolve(args.find((a) => !a.startsWith('--')) ?? '');
  const sourceJson = await readFile(join(topicDir, 'source.json'), 'utf8');
  const source = topicSourceSchema.parse(JSON.parse(sourceJson));
  const outDir = join(topicDir, 'knowledge');
  const cacheDir = join(outDir, 'cache');

  if (args.includes('--dry-run')) {
    let total = 0;
    for (const g of groupBlocks(source)) {
      const crops: ContentPart[] = [];
      for (const c of cropsFor(source, g)) {
        const png = await readFile(join(topicDir, c.path));
        crops.push({ type: 'image', png, sha256: createHash('sha256').update(png).digest('hex') });
      }
      const tokens = estimateTokens(
        [{ type: 'text', text: JSON.stringify(payloadFor(source, g)) }, ...crops],
        EXTRACT_SYSTEM,
      );
      total += tokens;
      console.log(
        `${g.id}: ${g.blockIds.length} blok, ${crops.length} şəkil, ~${tokens} input token · ${g.blockIds.join(',')}`,
      );
    }
    // Verification resends the crops with the claims; output ≈ 40% of input for extraction.
    const est = { input: total * 2, output: Math.round(total * 0.5), cacheWrite: 0, cacheRead: 0 };
    console.log(
      `Cəmi: ${groupBlocks(source).length * 2} çağırış, ~${est.input} input, ~${est.output} output token, ~$${costUsd(EXTRACT_MODEL, est)}`,
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
  const doc = buildDocument(source, sourceJson, results, calls);
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
