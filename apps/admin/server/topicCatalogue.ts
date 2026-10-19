import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { z } from 'zod';
import {
  effectiveContent,
  itemDecisions,
  knowledgeDocumentSchema,
  topicCatalogueSchema,
  topicReviewSchema,
} from '@mytutor/schemas';
import type { SubjectId, TopicCatalogue } from '@mytutor/types';
import { readCurriculum, scanBooks, scanCurricula } from './contentIndex';
import { transliterate } from './pipeline';
import { REVIEW_FILE } from './topicStatus';

/**
 * The topics a test book's questions may be keyed to: every topic of our textbooks of the
 * subject, by the curricula that hold them, with what each teaches. A topic whose knowledge is
 * approved says so in its own approved words; any other only by its title and opening lines.
 */

const readJson = async (path: string) => JSON.parse(await readFile(path, 'utf8')) as unknown;

const structureTopics = z.object({
  units: z.array(
    z.object({
      title: z.string(),
      items: z.array(
        z.object({ type: z.string(), number: z.string().optional(), title: z.string().optional() }),
      ),
    }),
  ),
});
const sourceLines = z.object({ lines: z.array(z.object({ text: z.string() })) });

/** "Riyaziyyat" → "riyaziyyat", "Azərbaycan dili" → "azerbaycan-dili": a subject's id. */
export const subjectIdOf = (title: string) =>
  transliterate(title)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const TAUGHT = new Set(['definition', 'rule', 'formula', 'term']);
const clip = (text: string, max: number) =>
  text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;

/** What an approved knowledge item states, in one line. */
function statementOf(content: unknown): string | null {
  const c = z
    .object({
      statement: z.string().optional(),
      text: z.string().optional(),
      term: z.string().optional(),
      latex: z.string().nullable().optional(),
    })
    .safeParse(content);
  if (!c.success) return null;
  const words = c.data.statement ?? c.data.text ?? c.data.term ?? '';
  const line = c.data.latex ? `${words} $${c.data.latex}$` : words;
  return line.trim() ? clip(line.trim(), 180) : null;
}

export async function topicCatalogue(root: string, subject: SubjectId): Promise<TopicCatalogue> {
  const books = await scanBooks(root);
  const curricula = (await scanCurricula(root))
    .filter((c) => subjectIdOf(c.subject) === subject)
    .sort((a, b) => (a.grade ?? 99) - (b.grade ?? 99));
  const topics: TopicCatalogue['topics'] = [];
  const bookList: TopicCatalogue['books'] = [];
  for (const entry of curricula) {
    const curriculum = await readCurriculum(root, entry.id);
    for (const { bookId } of curriculum?.textbooks ?? []) {
      const book = books.find((b) => b.id === bookId);
      if (!book?.structure || bookList.some((b) => b.bookId === bookId)) continue;
      const code = `B${bookList.length + 1}`;
      bookList.push({ code, bookId, title: book.title ?? bookId, grade: entry.grade });
      const structure = structureTopics.parse(await readJson(join(root, book.structure)));
      for (const unit of structure.units)
        for (const item of unit.items) {
          if (item.type !== 'topic' || !item.number) continue;
          const found = book.topics.find((t) => t.number === item.number);
          let teaches: string[] = [];
          let knowledge: 'approved' | 'none' = 'none';
          if (found?.knowledge) {
            const doc = knowledgeDocumentSchema.parse(await readJson(join(root, found.knowledge)));
            const review = await readJson(join(root, found.dir, REVIEW_FILE)).then(
              (data) => topicReviewSchema.parse(data),
              () => null,
            );
            const decisions = itemDecisions(doc.items, review);
            teaches = doc.items
              .filter((i) => TAUGHT.has(i.type) && decisions.get(i.id)?.decision === 'approved')
              .map((i) => statementOf(effectiveContent(i, decisions.get(i.id))))
              .filter((s): s is string => s !== null)
              .slice(0, 10);
            if (teaches.length) knowledge = 'approved';
          }
          if (!teaches.length && found?.source) {
            const source = sourceLines.safeParse(await readJson(join(root, found.source)));
            const opening = source.success
              ? source.data.lines
                  .map((l) => l.text)
                  .join(' ')
                  .replace(/\s+/g, ' ')
              : '';
            if (opening) teaches = [clip(opening, 400)];
          }
          topics.push({
            code: `${code}/${item.number}`,
            bookId,
            number: item.number,
            grade: entry.grade,
            unit: unit.title,
            title: item.title ?? item.number,
            knowledge,
            teaches,
          });
        }
    }
  }
  return topicCatalogueSchema.parse({ schemaVersion: 1, subject, books: bookList, topics });
}
