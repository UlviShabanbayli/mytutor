import type { CurriculumEntry } from '@mytutor/types';
import { missingSources, nextReviewTopic, type TopicRowData } from './stages';
import type { LibraryBook } from './useLibrary';

export type NextStep =
  | { kind: 'review'; book: LibraryBook; topic: TopicRowData }
  | { kind: 'extract'; book: LibraryBook; topics: string[] }
  | { kind: 'knowledge'; book: LibraryBook; count: number }
  | { kind: 'curricula' }
  | { kind: 'link'; book: LibraryBook };

/**
 * What to do next, most useful first: continue (or start) a review, extract missing sources
 * (free), build missing knowledge (terminal, paid), then curriculum work.
 */
export function nextSteps(library: LibraryBook[], curricula: CurriculumEntry[]): NextStep[] {
  const steps: NextStep[] = [];
  const started = library.find((b) => b.topics.some((t) => t.stage === 'review'));
  const reviewBook = started ?? library.find((b) => nextReviewTopic(b.topics));
  const reviewTopic = reviewBook ? nextReviewTopic(reviewBook.topics) : null;
  if (reviewBook && reviewTopic)
    steps.push({ kind: 'review', book: reviewBook, topic: reviewTopic });

  for (const book of library) {
    const missing = missingSources(book.topics);
    if (missing.length && book.book.canExtract)
      steps.push({ kind: 'extract', book, topics: missing.map((t) => t.number) });
  }
  for (const book of library) {
    const count = book.topics.filter((t) => t.stage === 'source').length;
    if (count) steps.push({ kind: 'knowledge', book, count });
  }
  if (curricula.length === 0) steps.push({ kind: 'curricula' });
  else {
    const unlinked = library.find(
      (b) => b.stats.withKnowledge > 0 && !b.book.curriculumLinks?.curriculumId,
    );
    if (unlinked) steps.push({ kind: 'link', book: unlinked });
  }
  return steps;
}
