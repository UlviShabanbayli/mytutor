import { useCallback } from 'react';
import { useSearchParams } from 'react-router';

/**
 * Selection kept in the URL (`?block=b05&page=86`) so a reviewer can share a link to exactly
 * what they are looking at. Updates replace the history entry instead of piling up.
 */
export function useSearchParam(key: string) {
  const [params, setParams] = useSearchParams();
  const value = params.get(key);
  const setValue = useCallback(
    (updates: Record<string, string | null>) =>
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          for (const [k, v] of Object.entries(updates)) {
            if (v === null) next.delete(k);
            else next.set(k, v);
          }
          return next;
        },
        { replace: true },
      ),
    [setParams],
  );
  return [value, setValue] as const;
}
