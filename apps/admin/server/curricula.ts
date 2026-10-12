import { randomBytes } from 'node:crypto';
import { rm } from 'node:fs/promises';
import { join } from 'node:path';
import { curriculumInputSchema, curriculumTextbookInputSchema } from '@mytutor/schemas';
import type { Curriculum } from '@mytutor/types';
import {
  CURRICULA_DIR,
  curriculumFile,
  exists,
  readCurriculum as read,
  scanBooks,
} from './contentIndex';
import { parseBody, writeJson } from './json';
import { exclusive, PipelineError } from './pipeline';

const noCurriculum = () => new PipelineError(404, 'no_curriculum', 'No such curriculum');

/** `cur_` and ten random lower-case letters or digits, not taken yet. */
async function newCurriculumId(root: string) {
  for (;;) {
    const bytes = randomBytes(10);
    const id = `cur_${[...bytes].map((b) => (b % 36).toString(36)).join('')}`;
    if (!(await exists(join(root, CURRICULA_DIR, id)))) return id;
  }
}

/** Reads, changes and writes one curriculum, one change at a time. */
async function update(root: string, id: string, change: (c: Curriculum) => Curriculum) {
  return exclusive(`curriculum:${id}`, async () => {
    const current = await read(root, id);
    if (!current) throw noCurriculum();
    const next = change(current);
    if (next !== current) await writeJson(curriculumFile(root, id), next);
    return next;
  });
}

type Clock = { now?: () => Date };

export async function createCurriculum({
  root,
  body,
  now = () => new Date(),
}: { root: string; body: unknown } & Clock) {
  const input = parseBody(curriculumInputSchema, body);
  const id = await newCurriculumId(root);
  const at = now().toISOString();
  const curriculum: Curriculum = {
    schemaVersion: 1,
    id,
    ...input,
    textbooks: [],
    createdAt: at,
    updatedAt: at,
  };
  await writeJson(curriculumFile(root, id), curriculum);
  return { id };
}

export async function saveCurriculum({
  root,
  id,
  body,
  now = () => new Date(),
}: { root: string; id: string; body: unknown } & Clock) {
  const input = parseBody(curriculumInputSchema, body);
  const saved = await update(root, id, (c) => ({ ...c, ...input, updatedAt: now().toISOString() }));
  return { updatedAt: saved.updatedAt };
}

/** Adds a textbook from the library; adding one that is already there changes nothing. */
export async function addCurriculumTextbook({
  root,
  id,
  body,
  now = () => new Date(),
}: { root: string; id: string; body: unknown } & Clock) {
  const { bookId } = parseBody(curriculumTextbookInputSchema, body);
  if (!(await read(root, id))) throw noCurriculum();
  if (!(await scanBooks(root)).some((b) => b.id === bookId))
    throw new PipelineError(404, 'no_book', 'Unknown book');
  const saved = await update(root, id, (c) => {
    if (c.textbooks.some((t) => t.bookId === bookId)) return c;
    const at = now().toISOString();
    return { ...c, textbooks: [...c.textbooks, { bookId, addedAt: at }], updatedAt: at };
  });
  return { updatedAt: saved.updatedAt };
}

/** Takes a textbook out of the curriculum; the book itself stays in the library. */
export async function removeCurriculumTextbook({
  root,
  id,
  bookId,
  now = () => new Date(),
}: { root: string; id: string; bookId: string } & Clock) {
  const saved = await update(root, id, (c) => {
    if (!c.textbooks.some((t) => t.bookId === bookId)) return c;
    return {
      ...c,
      textbooks: c.textbooks.filter((t) => t.bookId !== bookId),
      updatedAt: now().toISOString(),
    };
  });
  return { updatedAt: saved.updatedAt };
}

/**
 * Deletes a curriculum that holds nothing yet. One with textbooks is refused: take them out
 * first, so nothing an editor built is lost by one click.
 */
export async function deleteCurriculum({ root, id }: { root: string; id: string }) {
  return exclusive(`curriculum:${id}`, async () => {
    const current = await read(root, id);
    if (!current) throw noCurriculum();
    if (current.textbooks.length)
      throw new PipelineError(409, 'curriculum_not_empty', 'The curriculum still has textbooks');
    await rm(join(root, CURRICULA_DIR, id), { recursive: true, force: true });
    return { id };
  });
}
