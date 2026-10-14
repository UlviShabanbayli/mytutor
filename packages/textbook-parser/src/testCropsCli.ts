#!/usr/bin/env tsx
// Usage: pnpm --filter @mytutor/textbook-parser test-crops <test-book-dir>
// Cuts each question of questions.json out of its pages, and each of its figures, from the
// band ids Claude named (figure-bands.json, written by `content-engine test-book`): one
// cut-out per page and column. Writes questions/ and figures/ and fills in their paths.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { loadImage, createCanvas, type Canvas } from '@napi-rs/canvas';
import { z } from 'zod';
import { testPagesSchema, testQuestionsDocumentSchema } from '@mytutor/schemas';
import type { TestPageLayout } from '@mytutor/types';
import { cropBands } from './testPages';

const partsSchema = z.array(z.object({ page: z.number().int(), bands: z.array(z.string()) }));
const figureBandsSchema = z.record(
  z.string(),
  z.object({ question: partsSchema, figures: partsSchema }),
);

/** Band ids by column: a question that runs from one column into the next is cut twice. */
const byColumn = (ids: string[]) => {
  const groups = new Map<string, string[]>();
  for (const id of ids) groups.set(id[0] ?? '', [...(groups.get(id[0] ?? '') ?? []), id]);
  // Bands across the page (T, B, C) go with nothing else: they are cut on their own.
  return [...groups.values()];
};

async function main() {
  const dir = resolve(process.argv[2] ?? '');
  const pages = testPagesSchema.parse(JSON.parse(await readFile(join(dir, 'pages.json'), 'utf8')));
  const doc = testQuestionsDocumentSchema.parse(
    JSON.parse(await readFile(join(dir, 'questions.json'), 'utf8')),
  );
  const bands = figureBandsSchema.parse(
    JSON.parse(await readFile(join(dir, 'figure-bands.json'), 'utf8')),
  );
  const layouts = new Map<number, TestPageLayout>(pages.pages.map((p) => [p.page, p]));
  const images = new Map<number, Canvas>();
  const pageCanvas = async (page: number) => {
    const cached = images.get(page);
    if (cached) return cached;
    const layout = layouts.get(page);
    if (!layout) return null;
    const image = await loadImage(await readFile(join(dir, layout.image)));
    const canvas = createCanvas(image.width, image.height);
    canvas.getContext('2d').drawImage(image, 0, 0);
    images.set(page, canvas);
    return canvas;
  };
  await mkdir(join(dir, 'questions'), { recursive: true });
  await mkdir(join(dir, 'figures'), { recursive: true });

  const cut = async (id: string, parts: z.output<typeof partsSchema>, folder: string) => {
    const files: string[] = [];
    for (const part of parts) {
      const layout = layouts.get(part.page);
      const canvas = await pageCanvas(part.page);
      if (!layout || !canvas) continue;
      for (const ids of byColumn(part.bands)) {
        const picked = layout.bands.filter((b) => ids.includes(b.id));
        const piece = cropBands(canvas, picked);
        if (!piece) continue;
        const file = `${folder}/${id}-${files.length + 1}.png`;
        await writeFile(join(dir, file), piece.toBuffer('image/png'));
        files.push(file);
      }
    }
    return files;
  };

  for (const question of doc.questions) {
    const parts = bands[question.id];
    if (!parts) continue;
    question.crops = await cut(question.id, parts.question, 'questions');
    question.figures = await cut(question.id, parts.figures, 'figures');
  }
  await writeFile(join(dir, 'questions.json'), `${JSON.stringify(doc, null, 2)}\n`);
  console.log(
    `${doc.questions.length} sual: ${doc.questions.reduce((n, q) => n + q.crops.length, 0)} kəsik, ` +
      `${doc.questions.reduce((n, q) => n + q.figures.length, 0)} şəkil`,
  );
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
