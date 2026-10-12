import {
  createStandardSetResponseSchema,
  standardSetSchema,
  deleteStandardSetResponseSchema,
  savedResponseSchema,
} from '@mytutor/schemas';
import type { StandardSetInput, StandardLinksInput } from '@mytutor/types';
import { getJson, jsonBody, runAction } from '@/features/content/api';

export const fetchStandardSet = (path: string) => getJson(path, standardSetSchema);

export const createStandardSet = (input: StandardSetInput) =>
  runAction(['standard-sets'], createStandardSetResponseSchema, jsonBody(input));

export const saveStandardSet = (id: string, input: StandardSetInput) =>
  runAction(['standard-sets', id], savedResponseSchema, jsonBody(input));

/** Refused while a book links to the standard set (`standard_set_in_use`). */
export const deleteStandardSet = (id: string) =>
  runAction(['standard-sets', id], deleteStandardSetResponseSchema, { method: 'DELETE' });

export const saveStandardLinks = (bookId: string, links: StandardLinksInput) =>
  runAction(['books', bookId, 'standard-links'], savedResponseSchema, jsonBody(links));
