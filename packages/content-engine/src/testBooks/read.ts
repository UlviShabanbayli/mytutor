import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { z } from 'zod';
import { pageReadingSchema } from '@mytutor/schemas';
import type { AiCall, PageReading, TestPageLayout } from '@mytutor/types';
import { callClaude, readCached, type CallSpec, type ContentPart } from '../knowledge/claude';
import { estimateTokens } from '../knowledge/estimate';
import { costUsd } from '../knowledge/pricing';
import { TEST_READ_SYSTEM, TEST_READ_VERSION } from './prompts';

export const TEST_READ_MODEL = 'claude-opus-5-5';

/** Where each page's reading is kept, so the questions can be assembled again for free. */
export const readingFile = (dir: string, page: number) =>
  join(dir, 'readings', `page-${page}.json`);

async function markedImage(dir: string, layout: TestPageLayout): Promise<ContentPart> {
  const png = await readFile(join(dir, layout.marked));
  return { type: 'image', png, sha256: createHash('sha256').update(png).digest('hex') };
}

export function readSpec(
  layout: TestPageLayout,
  image: ContentPart,
): CallSpec<typeof pageReadingSchema> {
  return {
    id: `test-read:${layout.page}`,
    stage: 'test_read',
    model: TEST_READ_MODEL,
    effort: 'high',
    promptVersion: TEST_READ_VERSION,
    system: TEST_READ_SYSTEM,
    content: [
      image,
      {
        type: 'text',
        text: `PAGE ${layout.page} of the PDF. Bands: ${layout.bands.map((b) => b.id).join(' ')}`,
      },
    ],
    schema: pageReadingSchema,
    blockIds: [],
  };
}

/** Output tokens a page takes, thinking included: a generous guess for the estimate. */
const OUTPUT_PER_PAGE = 9000;

/** What reading `layouts` would cost; pages already read cost nothing. */
export async function estimateRead(dir: string, layouts: TestPageLayout[], cacheDir: string) {
  let input = 0;
  let calls = 0;
  for (const layout of layouts) {
    const spec = readSpec(layout, await markedImage(dir, layout));
    if (await readCached(spec, cacheDir)) continue;
    input += estimateTokens(spec.content, spec.system);
    calls++;
  }
  const usd = costUsd(TEST_READ_MODEL, {
    input,
    output: calls * OUTPUT_PER_PAGE,
    cacheWrite: 0,
    cacheRead: 0,
  });
  return { pages: layouts.length, calls, inputTokens: input, costUsd: usd };
}

/**
 * Reads pages with Claude, `concurrency` at a time; each page is its own call, so pages can
 * be read in any order and again for free. Every reading is written to `readings/`.
 */
export async function readPages(
  dir: string,
  layouts: TestPageLayout[],
  client: Parameters<typeof callClaude>[0],
  cacheDir: string,
  { concurrency = 4, onPage }: { concurrency?: number; onPage?: (page: number) => void } = {},
): Promise<AiCall[]> {
  await mkdir(join(dir, 'readings'), { recursive: true });
  const calls: AiCall[] = [];
  const queue = [...layouts];
  const worker = async () => {
    for (let layout = queue.shift(); layout; layout = queue.shift()) {
      const image = await markedImage(dir, layout);
      const read = await callClaude(client, readSpec(layout, image), cacheDir);
      calls.push(read.call);
      const saved: SavedReading = {
        marked: image.type === 'image' ? image.sha256 : '',
        reading: read.output,
      };
      await writeFile(readingFile(dir, layout.page), `${JSON.stringify(saved, null, 2)}\n`);
      onPage?.(layout.page);
    }
  };
  await Promise.all(Array.from({ length: Math.max(1, concurrency) }, worker));
  return calls;
}

/** A page's reading with the marked image it was read from: its band ids belong to that image. */
const savedReadingSchema = z.object({ marked: z.string(), reading: pageReadingSchema });
type SavedReading = z.output<typeof savedReadingSchema>;

/**
 * The readings on disk for these pages. A page not read yet is missing from the map, and so is
 * one read from an earlier rendering of the page: its band ids name other bands now.
 */
export async function loadReadings(dir: string, layouts: TestPageLayout[]) {
  const readings = new Map<number, PageReading>();
  for (const layout of layouts) {
    const text = await readFile(readingFile(dir, layout.page), 'utf8').catch(() => null);
    const saved = text ? savedReadingSchema.safeParse(JSON.parse(text)) : null;
    if (!saved?.success) continue;
    const image = await markedImage(dir, layout);
    if (image.type === 'image' && image.sha256 === saved.data.marked)
      readings.set(layout.page, saved.data.reading);
  }
  return readings;
}
