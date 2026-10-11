import { useQuery } from '@tanstack/react-query';
import type { ContentIndex } from '@mytutor/types';
import { fetchContentIndex, fetchKnowledge, fetchStructure, fetchTopicSource } from './api';

const indexQuery = { queryKey: ['content', 'index'], queryFn: fetchContentIndex } as const;

export function useContentIndex() {
  return useQuery(indexQuery);
}

/** The book entry from the content index; `data` is null when the id is unknown. */
export function useBook(bookId: string) {
  return useQuery({
    ...indexQuery,
    select: (index: ContentIndex) => index.books.find((b) => b.id === bookId) ?? null,
  });
}

export function useStructure(path: string | null) {
  return useQuery({
    queryKey: ['content', 'structure', path],
    queryFn: () => fetchStructure(path ?? ''),
    enabled: path !== null,
  });
}

export function useTopicSource(path: string | null) {
  return useQuery({
    queryKey: ['content', 'source', path],
    queryFn: () => fetchTopicSource(path ?? ''),
    enabled: path !== null,
  });
}

export function useKnowledge(path: string | null) {
  return useQuery({
    queryKey: ['content', 'knowledge', path],
    queryFn: () => fetchKnowledge(path ?? ''),
    enabled: path !== null,
  });
}
