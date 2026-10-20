import { readdir, readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { answersDocumentSchema, topicLessonSchema } from '@mytutor/schemas';
import type { AnswersDocument, BookAnswers, BookLesson, CourseTopic } from '@mytutor/types';
import { READY_BOOK, READY_TOPICS } from '@mytutor/demo-data';

/**
 * Book-derived content from the local content folder (Node only, never committed or deployed):
 * - approved lesson texts, `.curricula/<id>/lessons/<bookId>/<number>/lesson.json`;
 * - the book's answers, `<folder>/answers/answers.json`, picked by the topic's printed pages.
 * Only the ready volume, Riyaziyyat 7 (TRİMS) part 1, is mapped to the app's topics.
 */

/** The ready volume's PDF; its name without ".pdf" is the book id the pipelines use. */
export const READY_BOOK_FILE =
  'quot-riyaziyyat-quot-fanni-uzra-7-ci-sinif-ucun-1-ci-hissa-darslik.pdf';
const READY_BOOK_ID = READY_BOOK_FILE.replace(/\.pdf$/, '');

const topicOf = (topicId: string): CourseTopic | null =>
  READY_TOPICS.find((t) => t.id === topicId) ?? null;

const subdirs = async (dir: string) =>
  (await readdir(dir, { withFileTypes: true }).catch(() => []))
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();

async function readJson(path: string): Promise<unknown> {
  try {
    return JSON.parse(await readFile(path, 'utf8'));
  } catch {
    return null;
  }
}

/** The approved text of a topic's lesson, from the first curriculum that has one. */
export async function bookLesson(contentDir: string, topicId: string): Promise<BookLesson | null> {
  const topic = topicOf(topicId);
  if (!topic) return null;
  const curricula = join(contentDir, '.curricula');
  for (const id of await subdirs(curricula)) {
    const file = join(curricula, id, 'lessons', READY_BOOK_ID, topic.number, 'lesson.json');
    const parsed = topicLessonSchema.safeParse(await readJson(file));
    const text = parsed.success ? parsed.data.text : null;
    if (!text?.approvedAt) continue;
    return {
      topicId: topic.id,
      number: topic.number,
      book: READY_BOOK,
      sections: text.sections.map((s) => ({
        heading: s.heading,
        paragraphs: s.paragraphs.map((p) => p.text),
      })),
      approvedAt: text.approvedAt,
    };
  }
  return null;
}

/** The ready book's answer key, found by its PDF name and read again when it changes. */
export function answerKey(contentDir: string) {
  let cache: { path: string; mtime: number; doc: AnswersDocument } | null = null;
  return async (): Promise<AnswersDocument | null> => {
    for (const name of await subdirs(contentDir)) {
      if (name.startsWith('.')) continue;
      const path = join(contentDir, name, 'answers', 'answers.json');
      const info = await stat(path).catch(() => null);
      if (!info?.isFile()) continue;
      if (cache?.path === path && cache.mtime === info.mtimeMs) return cache.doc;
      const parsed = answersDocumentSchema.safeParse(await readJson(path));
      if (!parsed.success || parsed.data.book.file !== READY_BOOK_FILE) continue;
      cache = { path, mtime: info.mtimeMs, doc: parsed.data };
      return parsed.data;
    }
    return null;
  };
}

/** The book's answers to the exercises printed on the topic's pages. */
export async function bookAnswers(
  key: () => Promise<AnswersDocument | null>,
  topicId: string,
): Promise<BookAnswers | null> {
  const topic = topicOf(topicId);
  const doc = topic ? await key() : null;
  if (!topic || !doc) return null;
  return {
    topicId: topic.id,
    number: topic.number,
    book: READY_BOOK,
    pages: topic.pages,
    answers: doc.answers.filter((a) => a.page >= topic.pages.start && a.page <= topic.pages.end),
  };
}
