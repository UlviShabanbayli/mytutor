import { useQuery } from '@tanstack/react-query';
import { fetchStandardSet } from './api';

/** A standard set with its standards; disabled until its entry is known. */
export function useStandardSet(path: string | null) {
  return useQuery({
    // Under ['content'], so actions that change files refresh it.
    queryKey: ['content', 'standardSet', path],
    queryFn: () => fetchStandardSet(path ?? ''),
    enabled: path !== null,
  });
}
