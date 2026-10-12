import { createCurriculumResponseSchema, savedResponseSchema } from '@mytutor/schemas';
import type { CurriculumInput } from '@mytutor/types';
import { jsonBody, runAction } from '@/features/content/api';
import { z } from 'zod';

const deletedSchema = z.object({ id: z.string() });

export const createCurriculum = (input: CurriculumInput) =>
  runAction(['curricula'], createCurriculumResponseSchema, jsonBody(input));

export const saveCurriculum = (id: string, input: CurriculumInput) =>
  runAction(['curricula', id], savedResponseSchema, jsonBody(input));

/** Refused while the curriculum still has textbooks (`curriculum_not_empty`). */
export const deleteCurriculum = (id: string) =>
  runAction(['curricula', id], deletedSchema, { method: 'DELETE' });

export const addCurriculumTextbook = (id: string, bookId: string) =>
  runAction(['curricula', id, 'textbooks'], savedResponseSchema, jsonBody({ bookId }));

export const removeCurriculumTextbook = (id: string, bookId: string) =>
  runAction(['curricula', id, 'textbooks', bookId], savedResponseSchema, { method: 'DELETE' });
