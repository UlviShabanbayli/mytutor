import { answerDemo } from '@mytutor/demo-data';
import { todayResponseSchema } from '@mytutor/schemas';
import { ApiError, createApiGet, fallbackDelayMs } from './api';

const NOW = new Date('2026-10-20T06:00:00.000Z');

type Fetch = (url: string, init: RequestInit) => Promise<Response>;

function setup(fetchImpl: Fetch, timeoutMs = 2500) {
  const slept: number[] = [];
  const fetchMock = jest.fn(fetchImpl);
  const apiGet = createApiGet({
    baseUrl: 'http://api.test',
    fetch: fetchMock,
    now: () => NOW,
    sleep: async (ms) => {
      slept.push(ms);
    },
    timeoutMs,
  });
  return { apiGet, fetchMock, slept };
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

describe('apiGet', () => {
  it('returns the API’s answer and sends the persona', async () => {
    const { apiGet, fetchMock, slept } = setup(async () => json({ from: 'api' }));
    expect(await apiGet('/v1/today', { persona: 'fresh' })).toEqual({ from: 'api' });
    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(url).toBe('http://api.test/v1/today');
    expect(init?.headers).toEqual({ 'x-demo-persona': 'fresh' });
    expect(slept).toEqual([]);
  });

  it('answers from the demo world when the API cannot be reached', async () => {
    const { apiGet, slept } = setup(async () => {
      throw new TypeError('Network request failed');
    });
    const today = await apiGet('/v1/today', {
      persona: 'nermin',
      parse: todayResponseSchema.parse,
    });
    expect(today).toEqual(answerDemo('/v1/today', { persona: 'nermin', now: NOW }).body);
    expect(today.motivation.points.total).toBe(2140);
    expect(slept).toEqual([fallbackDelayMs('/v1/today')]);
  });

  it('gives up on a silent API after the timeout', async () => {
    const hanging: Fetch = (_url, init) =>
      new Promise((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => reject(new Error('aborted')));
      });
    const { apiGet } = setup(hanging, 20);
    const me = (await apiGet('/v1/me', { persona: 'fresh' })) as { persona: string };
    expect(me.persona).toBe('fresh');
  });

  it('keeps the API’s 404 and the demo’s 404 as errors', async () => {
    const online = setup(async () => json({ error: { code: 'not_found', message: '' } }, 404));
    await expect(
      online.apiGet('/v1/lessons/riyaziyyat-7-4-3/book', { persona: 'nermin' }),
    ).rejects.toEqual(new ApiError(404, '404 /v1/lessons/riyaziyyat-7-4-3/book'));
    const offline = setup(async () => {
      throw new TypeError('Network request failed');
    });
    await expect(offline.apiGet('/v1/lessons/nope', { persona: 'nermin' })).rejects.toBeInstanceOf(
      ApiError,
    );
  });
});

describe('fallbackDelayMs', () => {
  it('stays within 300–900 ms and is the same for a path every time', () => {
    const paths = ['/v1/me', '/v1/today', '/v1/hive', '/v1/exam?goal=graduation_9', '/v1/review'];
    for (const path of paths) {
      expect(fallbackDelayMs(path)).toBeGreaterThanOrEqual(300);
      expect(fallbackDelayMs(path)).toBeLessThanOrEqual(900);
      expect(fallbackDelayMs(path)).toBe(fallbackDelayMs(path));
    }
    expect(new Set(paths.map(fallbackDelayMs)).size).toBeGreaterThan(1);
  });
});
