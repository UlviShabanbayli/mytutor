import { randomBytes } from 'node:crypto';
import { rm } from 'node:fs/promises';
import { join } from 'node:path';
import { standardSetInputSchema, standardLinksInputSchema } from '@mytutor/schemas';
import type { StandardSet, StandardLinks } from '@mytutor/types';
import { readStandardSet, scanBooks, standardSetFile, standardSetFiles } from './contentIndex';
import { parseBody, writeJson } from './json';
import { bookKey, exclusive, PipelineError, topicNumbers, transliterate } from './pipeline';

/** Standard set ids are generated here: lower-case ASCII, digits and dashes. */
const STANDARD_SET_ID = /^[a-z0-9][a-z0-9-]{0,99}$/;

const noStandardSet = () => new PipelineError(404, 'no_standard_set', 'No such standardSet');

/** "Riyaziyyat 7 — ARTİ" → "riyaziyyat-7-arti-3f9a1c". */
function newStandardSetId(title: string) {
  const slug = transliterate(title)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return `${slug ? `${slug}-` : ''}${randomBytes(3).toString('hex')}`;
}

export type CreateStandardSetInput = { root: string; body: unknown; now?: () => Date };

export async function createStandardSet({
  root,
  body,
  now = () => new Date(),
}: CreateStandardSetInput) {
  const input = parseBody(standardSetInputSchema, body);
  const id = newStandardSetId(input.title);
  const standardSet: StandardSet = { id, ...input, updatedAt: now().toISOString() };
  await writeJson(standardSetFile(root, id), standardSet);
  return { id };
}

export type SaveStandardSetInput = CreateStandardSetInput & { id: string };

export async function saveStandardSet({
  root,
  id,
  body,
  now = () => new Date(),
}: SaveStandardSetInput) {
  if (!STANDARD_SET_ID.test(id)) throw noStandardSet();
  const input = parseBody(standardSetInputSchema, body);
  return exclusive(`standard-set:${id}`, async () => {
    if (!(await readStandardSet(root, id))) throw noStandardSet();
    const updatedAt = now().toISOString();
    await writeJson(standardSetFile(root, id), { id, ...input, updatedAt } satisfies StandardSet);
    return { updatedAt };
  });
}

export type DeleteStandardSetInput = { root: string; id: string };

/** Deletes a standard set no book links to; a linked one is refused, so no links lose meaning. */
export async function deleteStandardSet({ root, id }: DeleteStandardSetInput) {
  if (!STANDARD_SET_ID.test(id)) throw noStandardSet();
  return exclusive(`standard-set:${id}`, async () => {
    if (!(await readStandardSet(root, id))) throw noStandardSet();
    const users = (await scanBooks(root))
      .filter((book) => book.standardLinks?.standardSetId === id)
      .map((book) => book.title ?? book.id);
    if (users.length)
      throw new PipelineError(409, 'standard_set_in_use', `Linked from: ${users.join(', ')}`);
    // Deleting is the editor's explicit choice: both the current and a legacy copy go.
    for (const file of standardSetFiles(root, id)) await rm(file, { force: true });
    return { id };
  });
}

export type SaveStandardLinksInput = {
  root: string;
  bookId: string;
  body: unknown;
  now?: () => Date;
};

const unique = (codes: string[]) => [...new Set(codes)];

/**
 * Saves a book's links to its standard set. Every code must be a standard of that standard set,
 * except codes the saved links already had: a standard later removed from the standard set stays
 * linked (and flagged in the panel) until someone removes it, without blocking other edits.
 */
export async function saveStandardLinks({
  root,
  bookId,
  body,
  now = () => new Date(),
}: SaveStandardLinksInput) {
  const input = parseBody(standardLinksInputSchema, body);
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
    if (input.standardSetId === null) {
      if (allCodes.length)
        throw new PipelineError(400, 'no_standard_set', 'Links need a standardSet');
    } else {
      const standardSet = await readStandardSet(root, input.standardSetId);
      if (!standardSet) throw noStandardSet();
      const known = new Set(standardSet.standards.map((s) => s.code));
      const saved = book.standardLinks;
      if (saved?.standardSetId === input.standardSetId) {
        for (const code of Object.values(saved.topics).flat()) known.add(code);
        for (const code of saved.items.flatMap((i) => i.codes)) known.add(code);
      }
      const unknown = allCodes.find((code) => !known.has(code));
      if (unknown) throw new PipelineError(400, 'unknown_standard', `Unknown standard ${unknown}`);
    }

    const updatedAt = now().toISOString();
    const links: StandardLinks = {
      standardSetId: input.standardSetId,
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
