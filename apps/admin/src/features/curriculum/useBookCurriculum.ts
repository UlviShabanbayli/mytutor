import { useMemo } from 'react';
import type { ContentBookEntry } from '@mytutor/types';
import { useContentIndex } from '@/features/content/queries';
import { emptyLinks, toInput } from './links';
import { useSaveCurriculumLinks } from './mutations';
import { useCurriculum } from './queries';

/** A book's curriculum, its links to it, and the action that saves changed links. */
export function useBookCurriculum(book: ContentBookEntry | null | undefined) {
  const index = useContentIndex();
  const saved = book?.curriculumLinks ?? null;
  const links = useMemo(() => (saved ? toInput(saved) : emptyLinks()), [saved]);
  const entry = index.data?.curricula.find((c) => c.id === links.curriculumId) ?? null;
  const curriculum = useCurriculum(entry?.path ?? null);
  const save = useSaveCurriculumLinks(book?.id ?? '');
  return {
    curricula: index.data?.curricula ?? [],
    links,
    entry,
    curriculum: curriculum.data ?? null,
    isPending: entry !== null && curriculum.isPending,
    error: curriculum.error,
    refetch: () => void curriculum.refetch(),
    save,
  };
}

export type BookCurriculum = ReturnType<typeof useBookCurriculum>;
