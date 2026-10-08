import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import type { z } from 'zod';
import type { AiCall } from '@mytutor/types';
import { costUsd, type Usage } from './pricing';

export type ContentPart =
  { type: 'text'; text: string } | { type: 'image'; png: Buffer; sha256: string };

export type CallSpec<S extends z.ZodType> = {
  id: string;
  stage: AiCall['stage'];
  model: string;
  effort: 'low' | 'medium' | 'high' | 'xhigh' | 'max';
  promptVersion: string;
  system: string;
  content: ContentPart[];
  schema: S;
  blockIds: string[];
};

type Cached = { model: string; usage: Usage; output: unknown };

const sha = (s: string) => createHash('sha256').update(s).digest('hex');

/** Everything that determines the answer; images by hash. Same key → reuse, no API call. */
export function cacheKey(spec: CallSpec<z.ZodType>): string {
  return sha(
    JSON.stringify({
      model: spec.model,
      effort: spec.effort,
      promptVersion: spec.promptVersion,
      system: sha(spec.system),
      content: spec.content.map((c) => (c.type === 'text' ? sha(c.text) : c.sha256)),
    }),
  );
}

/**
 * One structured-output call: JSON validated with Zod, usage and cost recorded, result cached
 * on disk by input hash. Server-side fallbacks are on: a declined request is retried by the API
 * on a fallback model, and the model that actually answered is recorded.
 */
export async function callClaude<S extends z.ZodType>(
  client: Anthropic | null,
  spec: CallSpec<S>,
  cacheDir: string,
): Promise<{ output: z.output<S>; call: AiCall }> {
  const key = cacheKey(spec);
  const cacheFile = join(cacheDir, `${key}.json`);
  const record = (model: string, usage: Usage, cached: boolean): AiCall => ({
    id: spec.id,
    stage: spec.stage,
    model,
    promptVersion: spec.promptVersion,
    blockIds: spec.blockIds,
    inputTokens: usage.input,
    cacheCreationTokens: usage.cacheWrite,
    cacheReadTokens: usage.cacheRead,
    outputTokens: usage.output,
    costUsd: cached ? 0 : costUsd(model, usage),
    cached,
  });

  try {
    const hit = JSON.parse(await readFile(cacheFile, 'utf8')) as Cached;
    return { output: spec.schema.parse(hit.output), call: record(hit.model, hit.usage, true) };
  } catch {
    // not cached yet
  }
  if (!client)
    throw new Error(`No API credentials and no cached result for ${spec.id} (${spec.stage}).`);

  const format = zodOutputFormat(spec.schema);
  const stream = client.beta.messages.stream({
    model: spec.model,
    max_tokens: 64000,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    system: [{ type: 'text', text: spec.system, cache_control: { type: 'ephemeral' } }],
    output_config: { effort: spec.effort, format: { type: 'json_schema', schema: format.schema } },
    messages: [
      {
        role: 'user',
        content: spec.content.map((c) =>
          c.type === 'text'
            ? { type: 'text' as const, text: c.text }
            : {
                type: 'image' as const,
                source: {
                  type: 'base64' as const,
                  media_type: 'image/png' as const,
                  data: c.png.toString('base64'),
                },
              },
        ),
      },
    ],
  });
  const message = await stream.finalMessage();

  if (message.stop_reason === 'refusal')
    throw new Error(
      `${spec.id}: request declined (${message.stop_details?.category ?? 'no category'})`,
    );
  if (message.stop_reason === 'max_tokens')
    throw new Error(`${spec.id}: output hit max_tokens; split the group`);
  const text = message.content.flatMap((b) => (b.type === 'text' ? [b.text] : [])).join('');
  const output = spec.schema.parse(JSON.parse(text));
  const usage: Usage = {
    input: message.usage.input_tokens,
    output: message.usage.output_tokens,
    cacheWrite: message.usage.cache_creation_input_tokens ?? 0,
    cacheRead: message.usage.cache_read_input_tokens ?? 0,
  };

  await mkdir(cacheDir, { recursive: true });
  await writeFile(
    cacheFile,
    JSON.stringify({ model: message.model, usage, output } satisfies Cached, null, 2),
  );
  return { output, call: record(message.model, usage, false) };
}

/** A client when credentials exist (ANTHROPIC_API_KEY, auth token or `ant` profile); else null. */
export function createClient(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_AUTH_TOKEN) return null;
  return new Anthropic({ maxRetries: 3 });
}
