import type { UseQueryResult } from '@tanstack/react-query';

/**
 * Two queries read as one: pending while either is, an error when either fails, and the joined
 * data once both have it. Screens check `isPending` and `isError` and then read `data`, as they
 * do with a single query.
 */
export type JoinedQuery<T> =
  | { isPending: true; isError: false; data: undefined; refetch: () => Promise<unknown> }
  | { isPending: false; isError: true; data: undefined; refetch: () => Promise<unknown> }
  | { isPending: false; isError: false; data: T; refetch: () => Promise<unknown> };

export function joinQueries<A, B, T>(
  a: UseQueryResult<A>,
  b: UseQueryResult<B>,
  join: (a: A, b: B) => T,
): JoinedQuery<T> {
  const refetch = () => Promise.all([a.refetch(), b.refetch()]);
  if (a.isError || b.isError) return { isPending: false, isError: true, data: undefined, refetch };
  if (a.data === undefined || b.data === undefined)
    return { isPending: true, isError: false, data: undefined, refetch };
  return { isPending: false, isError: false, data: join(a.data, b.data), refetch };
}
