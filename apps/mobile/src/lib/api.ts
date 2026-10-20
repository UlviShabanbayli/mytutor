import { PERSONA_HEADER, answerDemo } from '@mytutor/demo-data';
import type { DemoPersona } from '@mytutor/types';

/**
 * The MyTutor API. On a phone "localhost" is the phone itself: set EXPO_PUBLIC_API_URL to the
 * computer's address on the network, or to the hosted demo API (see .env.example).
 */
export const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000').replace(
  /\/+$/,
  '',
);

/** A path the API serves (a test's figure, "media/q_….png") as a full URL. */
export const apiUrl = (path: string) => `${API_URL}/${path.replace(/^\/+/, '')}`;

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

export async function getJson(path: string): Promise<unknown> {
  const res = await fetch(apiUrl(path));
  if (!res.ok) throw new ApiError(res.status, `${res.status} ${path}`);
  return res.json();
}

/** How long the API gets before the app answers from its own demo data. */
export const API_TIMEOUT_MS = 2500;

/**
 * The simulated latency of an offline answer: 300–900 ms, always the same for a path, so
 * skeletons and fetch animations show as they would online.
 */
export function fallbackDelayMs(path: string): number {
  // FNV-1a: a small, stable hash of the path.
  let hash = 2166136261;
  for (let i = 0; i < path.length; i++) {
    hash ^= path.charCodeAt(i);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return 300 + (hash % 601);
}

type ApiGetDeps = {
  baseUrl: string;
  fetch: (url: string, init: RequestInit) => Promise<Response>;
  now: () => Date;
  sleep: (ms: number) => Promise<void>;
  timeoutMs: number;
};

export type ApiGetOptions<T> = {
  persona: DemoPersona;
  /** Checks the JSON (a schema's `parse`); the raw JSON when left out. */
  parse?: (value: unknown) => T;
};

/**
 * `apiGet("/v1/today", { persona })`: the API's answer, or, when the API cannot be reached
 * (a network error or no answer within 2.5 s), the same answer from `@mytutor/demo-data`'s
 * selectors after the simulated latency. An answer from the API that is not OK (a 404) is an
 * `ApiError`, and so is a demo answer that finds nothing.
 */
export function createApiGet(deps: ApiGetDeps) {
  async function fromApi(path: string, persona: DemoPersona): Promise<Response | null> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), deps.timeoutMs);
    try {
      return await deps.fetch(`${deps.baseUrl}${path}`, {
        headers: { [PERSONA_HEADER]: persona },
        signal: controller.signal,
      });
    } catch {
      return null;
    } finally {
      clearTimeout(timer);
    }
  }

  return async function apiGet<T = unknown>(path: string, options: ApiGetOptions<T>): Promise<T> {
    const parse = options.parse ?? ((value: unknown) => value as T);
    const res = await fromApi(path, options.persona);
    if (res) {
      if (!res.ok) throw new ApiError(res.status, `${res.status} ${path}`);
      return parse(await res.json());
    }
    await deps.sleep(fallbackDelayMs(path));
    const answer = answerDemo(path, { persona: options.persona, now: deps.now() });
    if (answer.status !== 200) throw new ApiError(answer.status, `${answer.status} ${path}`);
    return parse(answer.body);
  };
}

export const apiGet = createApiGet({
  baseUrl: API_URL,
  fetch: (url, init) => fetch(url, init),
  now: () => new Date(),
  sleep: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
  timeoutMs: API_TIMEOUT_MS,
});
