import type { ContentActionErrorCode } from '@mytutor/types';
import { ContentActionError } from './api';

/** The message key for a failed action, and the server's own text for the technical details. */
export function describeActionError(error: unknown): {
  code: ContentActionErrorCode;
  detail: string | null;
} {
  if (error instanceof ContentActionError)
    return { code: error.code, detail: error.message || null };
  return { code: 'internal', detail: error instanceof Error ? error.message : null };
}
