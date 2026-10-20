import type { DemoPersona, DemoWorld } from '@mytutor/types';
import { buildDemoWorld } from '../world';
import type { DemoQuery, DemoRequest } from './common';
import { DEMO_ROUTES, type DemoRoute } from './routes';

/** Matching a request path against the demo routes, and answering it from a world. */

/** The header (or query parameter) that picks the persona. */
export const PERSONA_HEADER = 'x-demo-persona';

export const personaOf = (value: string | null | undefined): DemoPersona =>
  value === 'fresh' ? 'fresh' : 'nermin';

export function parseQuery(search: string): DemoQuery {
  const query: DemoQuery = {};
  for (const pair of search.replace(/^\?/, '').split('&')) {
    if (!pair) continue;
    const [key = '', value = ''] = pair.split('=');
    const decode = (s: string) => {
      try {
        return decodeURIComponent(s.replace(/\+/g, ' '));
      } catch {
        return s;
      }
    };
    query[decode(key)] = decode(value);
  }
  return query;
}

/** The route a path ("/v1/lessons/riyaziyyat-7-4-3") matches, with its parameters. */
export function matchDemoRoute(
  path: string,
): { route: DemoRoute; params: Record<string, string> } | null {
  const parts = path.replace(/\/+$/, '').split('/');
  for (const route of DEMO_ROUTES) {
    const pattern = route.path.split('/');
    if (pattern.length !== parts.length) continue;
    const params: Record<string, string> = {};
    const ok = pattern.every((segment, i) => {
      const actual = parts[i] ?? '';
      if (segment.startsWith(':')) {
        if (!actual) return false;
        try {
          params[segment.slice(1)] = decodeURIComponent(actual);
        } catch {
          return false;
        }
        return true;
      }
      return segment === actual;
    });
    if (ok) return { route, params };
  }
  return null;
}

export type DemoAnswer =
  | { status: 200; body: unknown }
  | { status: 404; body: { error: { code: 'not_found'; message: string } } };

const notFound = (path: string): DemoAnswer => ({
  status: 404,
  body: { error: { code: 'not_found', message: `Not found: ${path}` } },
});

/** Answers one request from a world: the same JSON the API sends. */
export function answerFromWorld(world: DemoWorld, pathWithQuery: string): DemoAnswer {
  const [path = '', search = ''] = pathWithQuery.split('?');
  const found = matchDemoRoute(path);
  if (!found) return notFound(path);
  const request: DemoRequest = { params: found.params, query: parseQuery(search) };
  const body = found.route.select(world, request);
  return body === null || body === undefined ? notFound(path) : { status: 200, body };
}

/** Builds the persona's world at `now` and answers the request from it. */
export function answerDemo(
  pathWithQuery: string,
  options: { persona: DemoPersona; now: Date },
): DemoAnswer {
  return answerFromWorld(buildDemoWorld(options), pathWithQuery);
}
