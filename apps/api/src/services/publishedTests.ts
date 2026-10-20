import { readdir, readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { publishedTestsSchema } from '@mytutor/schemas';
import type { PublishedTests } from '@mytutor/types';
import type { TestsStore } from './content';

/**
 * The tests published for the app (`<content>/.published/tests/<subject>.json`, written by
 * `content-engine test-publish`), read from disk and kept until a file changes. Temporary until
 * the tests live in PostgreSQL (docs/decisions/0001): the routes stay the same then.
 */

const MEDIA_NAME = /^[A-Za-z0-9_-]+\.png$/;

export function publishedTests(contentDir: string): TestsStore {
  const testsDir = join(contentDir, '.published', 'tests');
  const mediaDir = join(contentDir, '.published', 'media');
  let cache: { key: string; books: PublishedTests[] } | null = null;

  /** Every published subject; read again only when a file was added, removed or rewritten. */
  async function load(): Promise<PublishedTests[]> {
    const names = (await readdir(testsDir).catch(() => [] as string[])).filter((n) =>
      n.endsWith('.json'),
    );
    const stamps = await Promise.all(
      names.map(async (n) => `${n}:${(await stat(join(testsDir, n))).mtimeMs}`),
    );
    const key = stamps.sort().join('|');
    if (cache?.key === key) return cache.books;
    const books = await Promise.all(
      names.map(async (n) =>
        publishedTestsSchema.parse(JSON.parse(await readFile(join(testsDir, n), 'utf8'))),
      ),
    );
    cache = { key, books };
    return books;
  }

  return {
    subjects: async () => (await load()).map((b) => b.subject),
    subject: async (id) => {
      const book = (await load()).find((b) => b.subject.id === id);
      return book ? { subject: book.subject, topics: book.topics } : null;
    },
    test: async (id) => (await load()).flatMap((b) => b.tests).find((t) => t.id === id) ?? null,
    recommended: async () =>
      (await load()).flatMap((b) => b.topics).find((t) => t.questionCount > 0) ?? null,
    media: async (file) => {
      if (!MEDIA_NAME.test(file)) return null;
      const path = join(mediaDir, file);
      if (!(await stat(path).catch(() => null))?.isFile()) return null;
      return new Uint8Array(await readFile(path));
    },
  };
}
