import { readdir, readFile, stat } from 'node:fs/promises';
import { basename, extname, join, posix, relative, resolve, sep } from 'node:path';
import { z } from 'zod';
import { bookMetaSchema, contentIndexSchema } from '@mytutor/schemas';
import type { ContentBookEntry, ContentIndex, ContentTopicEntry } from '@mytutor/types';

// Only the fields the index needs; full validation happens in the browser when a file is opened.
const structureHead = z.object({ source: z.object({ file: z.string() }) });
const sourceHead = z.object({
  book: z.object({ file: z.string() }),
  topic: z.object({ number: z.string() }),
});

const exists = (path: string) =>
  stat(path).then(
    () => true,
    () => false,
  );

async function readJson<T>(path: string, schema: z.ZodType<T>): Promise<T | null> {
  try {
    return schema.parse(JSON.parse(await readFile(path, 'utf8')));
  } catch {
    return null;
  }
}

async function subdirs(path: string): Promise<string[]> {
  try {
    const entries = await readdir(path, { withFileTypes: true });
    return entries
      .filter((e) => e.isDirectory())
      .map((e) => e.name)
      .sort();
  } catch {
    return [];
  }
}

const toPosix = (path: string) => path.split(sep).join(posix.sep);

/**
 * Scans `<root>/<folder>/` for parser outputs (`structure.json`, `topics/<n>/source.json`,
 * `topics/<n>/knowledge/knowledge.json`, optional `book.json`) and groups them by PDF file,
 * since the splitter and the source extractor may have written to different folders.
 */
export async function buildContentIndex(root: string): Promise<ContentIndex> {
  const books = new Map<string, ContentBookEntry>();
  const bookFor = (file: string) => {
    let book = books.get(file);
    if (!book) {
      book = { id: basename(file, extname(file)), file, title: null, structure: null, topics: [] };
      books.set(file, book);
    }
    return book;
  };

  for (const folder of await subdirs(root)) {
    const dir = join(root, folder);
    const rel = (path: string) => toPosix(relative(root, path));
    const files = new Set<string>();

    const structure = await readJson(join(dir, 'structure.json'), structureHead);
    if (structure) {
      const book = bookFor(structure.source.file);
      book.structure ??= rel(join(dir, 'structure.json'));
      files.add(structure.source.file);
    }

    for (const number of await subdirs(join(dir, 'topics'))) {
      const topicDir = join(dir, 'topics', number);
      const head = await readJson(join(topicDir, 'source.json'), sourceHead);
      if (!head) continue;
      const book = bookFor(head.book.file);
      files.add(head.book.file);
      if (book.topics.some((t) => t.number === head.topic.number)) continue;
      const knowledge = join(topicDir, 'knowledge', 'knowledge.json');
      const entry: ContentTopicEntry = {
        number: head.topic.number,
        dir: rel(topicDir),
        source: rel(join(topicDir, 'source.json')),
        knowledge: (await exists(knowledge)) ? rel(knowledge) : null,
      };
      book.topics.push(entry);
    }

    const meta = await readJson(join(dir, 'book.json'), bookMetaSchema);
    if (meta) for (const file of files) bookFor(file).title ??= meta.title;
  }

  return contentIndexSchema.parse({ books: [...books.values()] });
}

const SERVED = new Set(['.json', '.png']);

/**
 * Maps a `/content/<path>` request to a file under the root, or null when the path escapes
 * the root or is not a pipeline output type (JSON, PNG).
 */
export function resolveContentPath(root: string, urlPath: string): string | null {
  let decoded: string;
  try {
    decoded = decodeURIComponent(urlPath.split('?')[0] ?? '');
  } catch {
    return null;
  }
  if (decoded.includes('\0')) return null;
  const absRoot = resolve(root);
  const path = resolve(absRoot, `.${posix.sep}${decoded.replace(/^\/+/, '')}`);
  if (!path.startsWith(absRoot + sep)) return null;
  return SERVED.has(extname(path).toLowerCase()) ? path : null;
}
