#!/usr/bin/env tsx
// Usage: tsx server/topicCatalogueCli.ts <content-root> <test-book-id>
// Writes the test book's topics.json: every topic of our textbooks of its subject (by the
// curricula holding them) that its questions may be keyed to. No AI, no cost.
import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { testBookSchema } from '@mytutor/schemas';
import { TEST_BOOK_FILE, testBookDir } from './contentIndex';
import { writeJson } from './json';
import { topicCatalogue } from './topicCatalogue';

async function main() {
  const root = resolve(process.argv[2] ?? '');
  const id = process.argv[3] ?? '';
  const dir = testBookDir(root, id);
  const book = testBookSchema.parse(JSON.parse(await readFile(join(dir, TEST_BOOK_FILE), 'utf8')));
  const catalogue = await topicCatalogue(root, book.subject);
  await writeJson(join(dir, 'topics.json'), catalogue);
  const approved = catalogue.topics.filter((t) => t.knowledge === 'approved').length;
  console.log(
    `${catalogue.books.length} dərslik, ${catalogue.topics.length} mövzu (${approved} təsdiqlənmiş biliklə)`,
  );
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
