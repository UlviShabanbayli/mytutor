import { Hono } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import { MAX_DEMO_QUERY_BYTES, demoQuerySchema } from '@mytutor/schemas';
import { PERSONA_HEADER, answerFromWorld, applyDemoEvents, personaOf } from '@mytutor/demo-data';
import type { ApiError } from '@mytutor/types';
import type { WorldFactory } from './demo';

/**
 * POST /v1/query { path, events }: answers like `GET path`, with the device's demo events applied
 * to the world first. The server keeps nothing; the body is capped (200 events, 256 KB).
 */
export function queryRoutes(world: WorldFactory, now: () => Date) {
  const error = (code: string, message: string): ApiError => ({ error: { code, message } });
  return new Hono().post(
    '/query',
    bodyLimit({
      maxSize: MAX_DEMO_QUERY_BYTES,
      onError: (c) => c.json(error('payload_too_large', 'At most 256 KB of events'), 413),
    }),
    async (c) => {
      const raw: unknown = await c.req.json().catch(() => undefined);
      const parsed = demoQuerySchema.safeParse(raw);
      if (!parsed.success)
        return c.json(error('invalid_query', parsed.error.issues[0]?.message ?? 'Invalid'), 400);
      const persona = personaOf(c.req.header(PERSONA_HEADER) ?? c.req.query('persona'));
      const base = world({ now: now(), persona });
      const answer = answerFromWorld(applyDemoEvents(base, parsed.data.events), parsed.data.path);
      return c.json(answer.body as object, answer.status);
    },
  );
}
