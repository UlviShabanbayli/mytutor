import { z } from 'zod';

/** Error body returned by every API endpoint on failure. */
export const apiErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
});

export const healthResponseSchema = z.object({
  status: z.literal('ok'),
  version: z.string(),
});
