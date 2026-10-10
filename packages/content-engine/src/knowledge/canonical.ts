import { createHash } from 'node:crypto';

/** JSON with object keys sorted at every level and no whitespace: the same data, the same text. */
export function canonicalJson(value: unknown): string {
  return JSON.stringify(value, (_key, v: unknown) =>
    v && typeof v === 'object' && !Array.isArray(v)
      ? Object.fromEntries(
          Object.entries(v as Record<string, unknown>).sort(([a], [b]) => (a < b ? -1 : 1)),
        )
      : v,
  );
}

/**
 * SHA-256 of the canonical form. Used to tie a knowledge document to the source it came from,
 * so reformatting a file (e.g. by Prettier) does not make the document look stale.
 */
export const canonicalSha256 = (value: unknown) =>
  createHash('sha256').update(canonicalJson(value)).digest('hex');
