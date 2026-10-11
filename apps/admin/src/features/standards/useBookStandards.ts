import { useMemo } from 'react';
import type { ContentBookEntry } from '@mytutor/types';
import { useContentIndex } from '@/features/content/queries';
import { emptyLinks, toInput } from './links';
import { useSaveStandardLinks } from './mutations';
import { useStandardSet } from './queries';

/** A book's standard set, its links to it, and the action that saves changed links. */
export function useBookStandards(book: ContentBookEntry | null | undefined) {
  const index = useContentIndex();
  const saved = book?.standardLinks ?? null;
  const links = useMemo(() => (saved ? toInput(saved) : emptyLinks()), [saved]);
  const entry = index.data?.standardSets.find((c) => c.id === links.standardSetId) ?? null;
  const standardSet = useStandardSet(entry?.path ?? null);
  const save = useSaveStandardLinks(book?.id ?? '');
  return {
    standardSets: index.data?.standardSets ?? [],
    links,
    entry,
    standardSet: standardSet.data ?? null,
    isPending: entry !== null && standardSet.isPending,
    error: standardSet.error,
    refetch: () => void standardSet.refetch(),
    save,
  };
}

export type BookStandards = ReturnType<typeof useBookStandards>;
