#!/usr/bin/env tsx
// Usage: pnpm --filter @mytutor/textbook-parser test-pages <test-book-dir> [--pages 2-10,211]
// Renders a test book's pages (scans, no text layer) and finds their layout: the column rule
// and the bands of ink, each with an id, drawn in the margins of a marked copy for Claude.
// Writes pages/page-N.png, pages/page-N.marked.png and pages.json; no AI, no cost.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { testBookSchema, testPagesSchema } from '@mytutor/schemas';
import type { TestPageLayout, TestPages } from '@mytutor/types';
import { renderPage, sha256 } from './render';
import { grayOf, markBands, pageLayout } from './testPages';

/** The API reads images up to 1568 px on the long edge: render pages exactly that big. */
const LONG_EDGE = 1568;

/** "2-10,211" → [2, 3, …, 10, 211]; nothing → every page. */
function pageList(spec: string | undefined, count: number): number[] {
  if (!spec) return Array.from({ length: count }, (_, i) => i + 1);
  return spec
    .split(',')
    .flatMap((part) => {
      const [from = 0, to = from] = part.split('-').map(Number);
      return Array.from({ length: to - from + 1 }, (_, i) => from + i);
    })
    .filter((n) => n >= 1 && n <= count);
}

async function main() {
  const args = process.argv.slice(2);
  const dir = resolve(args.find((a) => !a.startsWith('--')) ?? '');
  const book = testBookSchema.parse(
    JSON.parse(await readFile(join(dir, 'test-book.json'), 'utf8')),
  );
  const bytes = new Uint8Array(await readFile(join(dir, book.pdf.file)));
  const pdfSha256 = sha256(bytes);
  const pdf = await getDocument({ data: bytes, verbosity: 0 }).promise;
  const wanted = pageList(
    args.includes('--pages') ? args[args.indexOf('--pages') + 1] : undefined,
    pdf.numPages,
  );
  const pagesFile = join(dir, 'pages.json');
  const previous = await readFile(pagesFile, 'utf8').then(
    (text) => testPagesSchema.parse(JSON.parse(text)),
    () => null,
  );
  const kept = new Map<number, TestPageLayout>(
    previous?.pdfSha256 === pdfSha256 ? previous.pages.map((p) => [p.page, p]) : [],
  );
  await mkdir(join(dir, 'pages'), { recursive: true });
  for (const n of wanted) {
    const page = await pdf.getPage(n);
    const [, , width = 1, height = 1] = page.view;
    const rendered = await renderPage(pdf, n, LONG_EDGE / Math.max(width, height));
    const layout = pageLayout(grayOf(rendered.canvas), n);
    const image = `pages/page-${n}.png`;
    const marked = `pages/page-${n}.marked.png`;
    await writeFile(join(dir, image), rendered.canvas.toBuffer('image/png'));
    await writeFile(
      join(dir, marked),
      markBands(rendered.canvas, layout.bands).toBuffer('image/png'),
    );
    kept.set(n, { ...layout, image, marked });
    console.log(`page ${n}: ${layout.bands.length} bands${layout.rule ? '' : ', one column'}`);
  }
  const doc: TestPages = testPagesSchema.parse({
    schemaVersion: 1,
    testBookId: book.id,
    pdfSha256,
    pages: [...kept.values()].sort((a, b) => a.page - b.page),
  });
  await writeFile(pagesFile, `${JSON.stringify(doc)}\n`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
