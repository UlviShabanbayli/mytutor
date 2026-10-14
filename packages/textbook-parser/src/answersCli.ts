#!/usr/bin/env tsx
// Usage: pnpm --filter @mytutor/textbook-parser answers <book.pdf> --out <dir> [--pages 141-142]
// Renders the book's answer-key pages ("CAVABLAR", found in the split's back matter, or the
// pages given) into <dir>/answers/: page images and source.json with each page's text layer.
// `content-engine answers <dir>/answers` then reads the answers from them.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename, join, resolve } from 'node:path';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { answerSourceSchema } from '@mytutor/schemas';
import type { AnswerSource } from '@mytutor/types';
import { extractPdf } from './extract';
import { splitExtracted } from './index';
import { groupLines } from './lines';
import { renderPage, sha256 } from './render';
import { repairBody } from './repair';

/**
 * Column of a line: answer keys print "s.N" page labels at the left of each column, so the
 * labels' x positions mark where columns start.
 */
function columnOf(lines: { text: string; x: number }[]) {
  const starts: number[] = [];
  for (const x of lines
    .filter((l) => /^s\.\d/.test(l.text))
    .map((l) => l.x)
    .sort((a, b) => a - b))
    if (!starts.some((s) => Math.abs(s - x) < 20)) starts.push(x);
  return (line: { x: number }) => starts.filter((s) => s <= line.x + 10).length;
}

/** The API reads images up to 1568 px on the long edge: render pages exactly that big. */
const LONG_EDGE = 1568;

async function main() {
  const args = process.argv.slice(2);
  const file = resolve(args.find((a) => a.endsWith('.pdf')) ?? '');
  const outArg = args.includes('--out') ? args[args.indexOf('--out') + 1] : undefined;
  if (!file.endsWith('.pdf') || !outArg) {
    console.error('İstifadə: answers <kitab.pdf> --out <kitab qovluğu> [--pages 141-142]');
    process.exit(1);
  }
  const outDir = join(resolve(outArg), 'answers');
  const extracted = await extractPdf(file);
  const pagesArg = args.includes('--pages') ? args[args.indexOf('--pages') + 1] : undefined;
  let from: number;
  let to: number;
  if (pagesArg) {
    [from, to] = pagesArg.split('-').map(Number) as [number, number];
    to ??= from;
  } else {
    const key = splitExtracted(extracted).backMatter.find((b) => b.kind === 'answers');
    if (!key) throw new Error('Kitabda «CAVABLAR» bölməsi tapılmadı: --pages ilə verin');
    ({ startPage: from, endPage: to } = key);
  }
  const offset = splitExtracted(extracted).source.printedPageOffset;

  const bytes = await readFile(file);
  const pdf = await getDocument({ data: new Uint8Array(bytes), verbosity: 0 }).promise;
  await mkdir(join(outDir, 'pages'), { recursive: true });
  const pages: AnswerSource['pages'] = [];
  for (let page = from; page <= to; page++) {
    const p = await pdf.getPage(page);
    const [, , width = 1, height = 1] = p.view;
    const rendered = await renderPage(pdf, page, LONG_EDGE / Math.max(width, height));
    const image = `pages/page-${page}.png`;
    await writeFile(join(outDir, image), rendered.canvas.toBuffer('image/png'));
    const lines = groupLines(
      extracted.items.filter((i) => i.page === page),
      repairBody,
      { keepLabels: true },
    ).map((l) => ({ text: l.text, x: Math.round(l.x), top: Math.round(height - l.y) }));
    const column = columnOf(lines);
    lines.sort((a, b) => column(a) - column(b) || a.top - b.top || a.x - b.x);
    pages.push({ page, printedPage: offset === null ? null : page - offset, image, lines });
  }
  const source = answerSourceSchema.parse({
    schemaVersion: 1,
    book: { file: basename(file), sha256: sha256(bytes) },
    pages,
  } satisfies AnswerSource);
  await writeFile(join(outDir, 'source.json'), `${JSON.stringify(source, null, 2)}\n`);
  console.log(`${pages.length} cavab səhifəsi (${from}–${to}) → ${outDir}`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
