#!/usr/bin/env tsx
// Usage: pnpm --filter @mytutor/textbook-parser source <book.pdf> --topic 4.1 [--out <dir>] [--inline]
// Writes source.json, page images, block crops, figure crops and review.html for one topic.
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { basename, extname, join, resolve } from 'node:path';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { topicSourceSchema } from '@mytutor/schemas';
import type { TopicSource } from '@mytutor/types';
import { bodySize } from './classify';
import { extractPdf } from './extract';
import { readGraphics } from './graphics';
import { splitTextbook } from './index';
import { crop, renderPage, sha256 } from './render';
import { renderReview } from './reviewHtml';
import { buildTopicSource } from './topicSource';
import { parserVersion } from './version';

const SCALE = 2;

async function main() {
  const args = process.argv.slice(2);
  const file = resolve(args.find((a) => !a.startsWith('--') && a.endsWith('.pdf')) ?? '');
  const topicNumber = args[args.indexOf('--topic') + 1];
  if (!file.endsWith('.pdf') || !args.includes('--topic') || !topicNumber) {
    console.error('İstifadə: source <kitab.pdf> --topic 4.1 [--out <qovluq>] [--inline]');
    process.exit(1);
  }
  const outArg = args.includes('--out') ? args[args.indexOf('--out') + 1] : undefined;
  const outDir = resolve(
    outArg ?? join('out', basename(file, extname(file)), 'topics', topicNumber),
  );

  const structure = await splitTextbook(file);
  const unit = structure.units.find((u) =>
    u.items.some((i) => i.type === 'topic' && i.number === topicNumber),
  );
  const topic = unit?.items.find((i) => i.type === 'topic' && i.number === topicNumber);
  if (!unit || !topic || topic.type !== 'topic') throw new Error(`Mövzu ${topicNumber} tapılmadı`);

  const bytes = await readFile(file);
  const extracted = await extractPdf(file);
  const task = getDocument({ data: new Uint8Array(bytes), verbosity: 0 });
  const pdf = await task.promise;
  const first = await pdf.getPage(topic.startPage);
  const [, , width = 0, height = 0] = first.view;

  const pageNumbers = Array.from(
    { length: topic.endPage - topic.startPage + 1 },
    (_, i) => topic.startPage + i,
  );
  const graphics = [];
  const rendered = new Map<number, Awaited<ReturnType<typeof renderPage>>>();
  for (const n of pageNumbers) {
    graphics.push(await readGraphics(await pdf.getPage(n), height));
    rendered.set(n, await renderPage(pdf, n, SCALE));
  }

  const draft = buildTopicSource({
    topic,
    unit: { index: unit.index, title: unit.title },
    items: extracted.items,
    graphics,
    page: { width, height },
    body: bodySize(extracted.items),
    printedPageOffset: structure.source.printedPageOffset,
  });

  // Generated image folders are rebuilt from scratch, so a re-run leaves no orphan crops.
  // Anything else in the topic folder (e.g. knowledge/) is kept.
  for (const d of ['pages', 'crops', 'figures']) {
    await rm(join(outDir, d), { recursive: true, force: true });
    await mkdir(join(outDir, d), { recursive: true });
  }
  const pages: TopicSource['pages'] = [];
  for (const n of pageNumbers) {
    const r = rendered.get(n);
    if (!r) continue;
    const png = r.canvas.toBuffer('image/png');
    const image = `pages/p${String(n).padStart(3, '0')}.png`;
    await writeFile(join(outDir, image), png);
    const offset = structure.source.printedPageOffset;
    pages.push({
      page: n,
      printedPage: offset === null ? null : n - offset,
      width,
      height,
      image,
      imageScale: SCALE,
      imageSha256: sha256(png),
    });
  }
  for (const b of draft.blocks) {
    for (const [i, region] of b.regions.entries()) {
      const r = rendered.get(region.page);
      const path = b.crops[i];
      if (r && path) await writeFile(join(outDir, path), crop(r, region.bbox));
    }
  }
  for (const f of draft.figures) {
    const r = rendered.get(f.region.page);
    if (r) await writeFile(join(outDir, f.image), crop(r, f.region.bbox));
  }
  await task.destroy();

  const source = topicSourceSchema.parse({
    schemaVersion: 1,
    parserVersion: parserVersion(),
    book: {
      file: basename(file),
      sha256: sha256(bytes),
      pageCount: structure.source.pageCount,
      printedPageOffset: structure.source.printedPageOffset,
    },
    pages,
    ...draft,
  });
  await writeFile(join(outDir, 'source.json'), `${JSON.stringify(source, null, 2)}\n`);
  await writeFile(
    join(outDir, 'review.html'),
    await renderReview(source, outDir, { inline: args.includes('--inline') }),
  );

  const counts = new Map<string, number>();
  for (const b of source.blocks) counts.set(b.kind, (counts.get(b.kind) ?? 0) + 1);
  console.log(
    `${source.topic.number}. ${source.topic.title} — PDF ${topic.startPage}–${topic.endPage}`,
  );
  console.log(`Bloklar: ${[...counts].map(([k, v]) => `${k} ${v}`).join(', ')}`);
  console.log(
    `Sətirlər: ${source.lines.length} (düsturlu ${source.lines.filter((l) => l.math).length}), fiqurlar: ${source.figures.length}`,
  );
  for (const w of source.warnings) console.log(`⚠️  ${w}`);
  console.log(`Yazıldı: ${outDir}`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
