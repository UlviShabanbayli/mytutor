import { Hono } from 'hono';
import { DEMO_ROUTES, PERSONA_HEADER, personaOf } from '@mytutor/demo-data';
import type { ApiError, DemoPersona, DemoWorld } from '@mytutor/types';

/** Builds the demo world for one request: the persona's world at the request's time. */
export type WorldFactory = (options: { now: Date; persona: DemoPersona }) => DemoWorld;

/**
 * The demo world under /v1, one route per resource of `DEMO_ROUTES` (the same table the app's
 * offline fallback answers from). The persona comes from the `x-demo-persona` header or the
 * `persona` query parameter, "nermin" by default; "now" is the request's time.
 */
export function demoRoutes(world: WorldFactory, now: () => Date) {
  const router = new Hono();
  for (const route of DEMO_ROUTES) {
    router.get(route.path.replace(/^\/v1/, ''), (c) => {
      const persona = personaOf(c.req.header(PERSONA_HEADER) ?? c.req.query('persona'));
      const body = route.select(world({ now: now(), persona }), {
        params: c.req.param() as Record<string, string>,
        query: c.req.query(),
      });
      if (body === null || body === undefined) {
        const missing: ApiError = {
          error: { code: 'not_found', message: `Not found: ${c.req.path}` },
        };
        return c.json(missing, 404);
      }
      return c.json(body as object);
    });
  }
  return router;
}
