import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

/** The content the panel and pipelines write: the app's published tests are inside it. */
const DEFAULT_CONTENT_DIR = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../../packages/textbook-parser/out',
);

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.url().optional(),
  CONTENT_DIR: z.string().min(1).default(DEFAULT_CONTENT_DIR),
});

export type Env = z.output<typeof envSchema>;

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  return envSchema.parse(source);
}
