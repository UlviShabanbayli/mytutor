import { useQuery } from '@tanstack/react-query';
import type { ContentBookEntry } from '@mytutor/types';
import { fetchCurriculum, fetchCurriculumLinks } from './api';

/** A curriculum with its standards; disabled until its entry is known. */
export function useCurriculum(path: string | null) {
  return useQuery({
    // Under ['content'], so actions that change files refresh it.
    queryKey: ['content', 'curriculum', path],
    queryFn: () => fetchCurriculum(path ?? ''),
    enabled: path !== null,
  });
}

/** A book's saved links; null when it has none yet. */
export function useCurriculumLinks(book: ContentBookEntry | null | undefined) {
  const path = book?.links ?? null;
  return useQuery({
    queryKey: ['content', 'curriculum-links', book?.id ?? null, path],
    queryFn: () => (path ? fetchCurriculumLinks(path) : Promise.resolve(null)),
    enabled: Boolean(book),
  });
}
