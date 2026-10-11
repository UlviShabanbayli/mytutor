import { randomBytes } from 'node:crypto';
import { mkdir, rename, rm, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import type { z } from 'zod';
import { PipelineError } from './pipeline';

/** Writes JSON through a temporary file, so a crash never leaves half a file behind. */
export async function writeJson(path: string, data: unknown) {
  await mkdir(dirname(path), { recursive: true });
  const temp = `${path}.${randomBytes(4).toString('hex')}.tmp`;
  try {
    await writeFile(temp, `${JSON.stringify(data, null, 2)}\n`);
    await rename(temp, path);
  } catch (error) {
    await rm(temp, { force: true });
    throw error;
  }
}

/** A request body checked against its schema; the first problem becomes a 400. */
export function parseBody<T extends z.ZodTypeAny>(schema: T, body: unknown): z.output<T> {
  const result = schema.safeParse(body);
  if (result.success) return result.data;
  const issue = result.error.issues[0];
  throw new PipelineError(
    400,
    'bad_request',
    issue ? `${issue.path.join('.')}: ${issue.message}` : 'Bad request',
  );
}
