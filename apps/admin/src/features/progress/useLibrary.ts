import { useQueries } from '@tanstack/react-query';
import type { ContentBookEntry } from '@mytutor/types';
import { fetchStructure } from '@/features/content/api';
import { useContentIndex } from '@/features/content/queries';
import { bookStats, bookUnits, type BookStats, type UnitData } from './stages';

export type LibraryBook = {
  book: ContentBookEntry;
  units: UnitData[];
  topics: UnitData['topics'];
  stats: BookStats;
  /** False while the book's structure is loading. */
  ready: boolean;
};

/** Every book with its units, topics and counts: what the overview, lanes and search show. */
export function useLibrary() {
  const index = useContentIndex();
  const books = index.data?.books ?? [];
  const structures = useQueries({
    queries: books.map((book) => ({
      queryKey: ['content', 'structure', book.structure],
      queryFn: () => fetchStructure(book.structure ?? ''),
      enabled: book.structure !== null,
    })),
  });
  const library: LibraryBook[] = books.map((book, i) => {
    const units = bookUnits(book, structures[i]?.data);
    const topics = units.flatMap((u) => u.topics);
    return {
      book,
      units,
      topics,
      stats: bookStats(topics),
      ready: book.structure === null || structures[i]?.data !== undefined,
    };
  });
  return { index, library };
}
