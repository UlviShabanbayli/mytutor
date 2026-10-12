import { useQuery } from '@tanstack/react-query';
import { fetchCurriculum } from './api';

/** A curriculum with its standards; disabled until its entry is known. */
export function useCurriculum(path: string | null) {
  return useQuery({
    // Under ['content'], so actions that change files refresh it.
    queryKey: ['content', 'curriculum', path],
    queryFn: () => fetchCurriculum(path ?? ''),
    enabled: path !== null,
  });
}
