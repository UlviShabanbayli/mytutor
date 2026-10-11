import { randomBytes } from 'node:crypto';
import { mkdir, rename, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import type { z } from 'zod';
import {
  curriculumInputSchema,
  curriculumLinksInputSchema,
  curriculumLinksSchema,
} from '@mytutor/schemas';
import type { Curriculum, CurriculumLinks } from '@mytutor/types';
import { curriculumFile, exists, readCurriculum, readJson, scanBooks } from './contentIndex';
import { bookKey, exclusive, PipelineError, topicNumbers, transliterate } from './pipeline';

/** Writes JSON through a temporary file, so a crash never leaves half a file behind. */
async function writeJson(path: string, data: unknown) {
  await mkdir(dirname(path), { recursive: true });
  const temp = `${path}.${randomBytes(4).toString('hex')}.tmp`;
  try {
    await writeFile(temp, `${JSON.stringify(data, null, 2)}\n`);
    await rename(temp, path);
  } catch (error) {
    await rm(temp, { force: true });
    throw error;
  }
}

function parse<T extends z.ZodTypeAny>(schema: T, body: unknown): z.output<T> {
  const result = schema.safeParse(body);
  if (result.success) return result.data;
  const issue = result.error.issues[0];
  throw new PipelineError(
    400,
    'bad_request',
    issue ? `${issue.path.join('.')}: ${issue.message}` : 'Bad request',
  );
}

/** Curriculum ids are generated here: lower-case ASCII, digits and dashes. */
const CURRICULUM_ID = /^[a-z0-9][a-z0-9-]{0,99}$/;

const noCurriculum = () => new PipelineError(404, 'no_curriculum', 'No such curriculum');

/** "Riyaziyyat 7 — ARTİ" → "riyaziyyat-7-arti-3f9a1c". */
function newCurriculumId(title: string) {
  const slug = transliterate(title)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return `${slug ? `${slug}-` : ''}${randomBytes(3).toString('hex')}`;
}

export type CreateCurriculumInput = { root: string; body: unknown; now?: () => Date };

export async function createCurriculum({
  root,
  body,
  now = () => new Date(),
}: CreateCurriculumInput) {
  const input = parse(curriculumInputSchema, body);
  const id = newCurriculumId(input.title);
  const curriculum: Curriculum = { id, ...input, updatedAt: now().toISOString() };
  await writeJson(curriculumFile(root, id), curriculum);
  return { id };
}

export type SaveCurriculumInput = CreateCurriculumInput & { id: string };

export async function saveCurriculum({
  root,
  id,
  body,
  now = () => new Date(),
}: SaveCurriculumInput) {
  if (!CURRICULUM_ID.test(id)) throw noCurriculum();
  const input = parse(curriculumInputSchema, body);
  return exclusive(`curriculum:${id}`, async () => {
    if (!(await exists(curriculumFile(root, id)))) throw noCurriculum();
    const updatedAt = now().toISOString();
    await writeJson(curriculumFile(root, id), { id, ...input, updatedAt } satisfies Curriculum);
    return { updatedAt };
  });
}

const readLinks = (file: string) => readJson(file, curriculumLinksSchema);

export type DeleteCurriculumInput = { root: string; id: string };

/** Deletes a curriculum no book links to; a linked one is refused, so no links lose meaning. */
export async function deleteCurriculum({ root, id }: DeleteCurriculumInput) {
  if (!CURRICULUM_ID.test(id)) throw noCurriculum();
  return exclusive(`curriculum:${id}`, async () => {
    const file = curriculumFile(root, id);
    if (!(await exists(file))) throw noCurriculum();
    const users = (await scanBooks(root))
      .filter((book) => book.curriculumId === id)
      .map((book) => book.title ?? book.id);
    if (users.length)
      throw new PipelineError(409, 'curriculum_in_use', `Linked from: ${users.join(', ')}`);
    await rm(file, { force: true });
    return { id };
  });
}

export type SaveCurriculumLinksInput = {
  root: string;
  bookId: string;
  body: unknown;
  now?: () => Date;
};

const unique = (codes: string[]) => [...new Set(codes)];

/**
 * Saves a book's links to its curriculum. Every code must be a standard of that curriculum,
 * except codes the saved links already had: a standard later removed from the curriculum stays
 * linked (and flagged in the panel) until someone removes it, without blocking other edits.
 */
export async function saveCurriculumLinks({
  root,
  bookId,
  body,
  now = () => new Date(),
}: SaveCurriculumLinksInput) {
  const input = parse(curriculumLinksInputSchema, body);
  return exclusive(bookKey(bookId), async () => {
    const book = (await scanBooks(root)).find((b) => b.id === bookId);
    if (!book?.linksFile) throw new PipelineError(404, 'no_book', 'Unknown book');
    // Topics of the book's structure, extracted or not.
    const topics = new Set([
      ...(book.structure ? await topicNumbers(join(root, book.structure)) : []),
      ...book.topics.map((t) => t.number),
    ]);
    const badTopic = [...Object.keys(input.topics), ...input.items.map((i) => i.topic)].find(
      (topic) => !topics.has(topic),
    );
    if (badTopic) throw new PipelineError(400, 'bad_topic', `Unknown topic ${badTopic}`);

    const allCodes = [
      ...Object.values(input.topics).flat(),
      ...input.items.flatMap((i) => i.codes),
    ];
    if (input.curriculumId === null) {
      if (allCodes.length) throw new PipelineError(400, 'no_curriculum', 'Links need a curriculum');
    } else {
      const curriculum = await readCurriculum(root, input.curriculumId);
      if (!curriculum) throw noCurriculum();
      const known = new Set(curriculum.standards.map((s) => s.code));
      const saved = await readLinks(book.linksFile);
      if (saved?.curriculumId === input.curriculumId) {
        for (const code of Object.values(saved.topics).flat()) known.add(code);
        for (const code of saved.items.flatMap((i) => i.codes)) known.add(code);
      }
      const unknown = allCodes.find((code) => !known.has(code));
      if (unknown) throw new PipelineError(400, 'unknown_standard', `Unknown standard ${unknown}`);
    }

    const updatedAt = now().toISOString();
    const links: CurriculumLinks = {
      curriculumId: input.curriculumId,
      topics: Object.fromEntries(
        Object.entries(input.topics)
          .map(([topic, codes]) => [topic, unique(codes)] as const)
          .filter(([, codes]) => codes.length),
      ),
      items: input.items.map((item) => ({ ...item, codes: unique(item.codes) })),
      updatedAt,
    };
    await writeJson(book.linksFile, links);
    return { updatedAt };
  });
}
