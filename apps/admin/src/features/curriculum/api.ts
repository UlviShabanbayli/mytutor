import {
  createCurriculumResponseSchema,
  curriculumSchema,
  deleteCurriculumResponseSchema,
  savedResponseSchema,
} from '@mytutor/schemas';
import type { CurriculumInput, CurriculumLinksInput } from '@mytutor/types';
import { getJson, jsonBody, runAction } from '@/features/content/api';

export const fetchCurriculum = (path: string) => getJson(path, curriculumSchema);

export const createCurriculum = (input: CurriculumInput) =>
  runAction(['curricula'], createCurriculumResponseSchema, jsonBody(input));

export const saveCurriculum = (id: string, input: CurriculumInput) =>
  runAction(['curricula', id], savedResponseSchema, jsonBody(input));

/** Refused while a book links to the curriculum (`curriculum_in_use`). */
export const deleteCurriculum = (id: string) =>
  runAction(['curricula', id], deleteCurriculumResponseSchema, { method: 'DELETE' });

export const saveCurriculumLinks = (bookId: string, links: CurriculumLinksInput) =>
  runAction(['books', bookId, 'curriculum-links'], savedResponseSchema, jsonBody(links));
