import type { LibraryBook } from './useLibrary';
import type { TopicRowData } from './stages';

export type TopicHit = { bookId: string; bookTitle: string; topic: TopicRowData };

const fold = (text: string) => text.toLocaleLowerCase('az').normalize('NFC');

/** Topics whose number starts with the query, or whose title holds all its words. */
export function searchTopics(
  library: { book: LibraryBook['book']; topics: TopicRowData[]; title: string }[],
  query: string,
  limit = 8,
): TopicHit[] {
  const q = fold(query.trim());
  if (!q) return [];
  const words = q.split(/\s+/);
  const hits: TopicHit[] = [];
  for (const { book, topics, title } of library)
    for (const topic of topics) {
      const text = fold(topic.title);
      if (topic.number.startsWith(q) || words.every((w) => text.includes(w)))
        hits.push({ bookId: book.id, bookTitle: title, topic });
    }
  return hits.slice(0, limit);
}

/** Where a topic opens: its review once it has knowledge, else its source, else its book. */
export function topicUrl(bookId: string, topic: TopicRowData): string {
  const book = `/books/${encodeURIComponent(bookId)}`;
  const base = `${book}/topics/${encodeURIComponent(topic.number)}`;
  if (topic.entry?.knowledge) return `${base}/review`;
  return topic.entry ? `${base}/source` : book;
}
