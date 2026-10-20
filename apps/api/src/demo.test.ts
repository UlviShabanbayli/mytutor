import { describe, expect, it } from 'vitest';
import {
  apiErrorSchema,
  meResponseSchema,
  studyLessonSchema,
  todayResponseSchema,
} from '@mytutor/schemas';
import { DEMO_ROUTES, answerDemo, buildDemoWorld } from '@mytutor/demo-data';
import { createApp } from './app';

// 2026-10-20 10:00 in Baku.
const NOW = new Date('2026-10-20T06:00:00.000Z');
const app = createApp({ now: () => NOW });

const json = async (path: string, init?: RequestInit) => {
  const res = await app.request(path, init);
  return { status: res.status, body: (await res.json()) as unknown };
};

describe('demo world under /v1', () => {
  it('serves Nərmin by default', async () => {
    const { status, body } = await json('/v1/me');
    expect(status).toBe(200);
    const me = meResponseSchema.parse(body);
    expect([me.persona, me.profile.points.total, me.honeyCells]).toEqual(['nermin', 2140, 17]);
  });

  it('switches persona by header or query', async () => {
    const header = await json('/v1/today', { headers: { 'x-demo-persona': 'fresh' } });
    const query = await json('/v1/today?persona=fresh');
    for (const { body } of [header, query]) {
      const today = todayResponseSchema.parse(body);
      expect([today.studentName, today.plan, today.motivation.points.total]).toEqual([null, [], 0]);
    }
    expect(todayResponseSchema.parse((await json('/v1/today')).body).studentName).toBe('Nərmin');
  });

  it('takes now from the request time', async () => {
    const later = createApp({ now: () => new Date(NOW.getTime() + 24 * 3_600_000) });
    const live = async (a: ReturnType<typeof createApp>) =>
      ((await (await a.request('/v1/classes/7b/live')).json()) as { startsAt: string }).startsAt;
    expect(await live(app)).toBe('2026-10-21T14:00:00.000Z');
    expect(await live(later)).toBe('2026-10-22T14:00:00.000Z');
  });

  it('answers every route with the same JSON as the app’s offline fallback', async () => {
    const paths = [
      '/v1/hive',
      '/v1/lessons/riyaziyyat-7-4-3',
      '/v1/exam?goal=graduation_9',
      '/v1/messages?role=teacher',
      '/v1/parent/children/nermin/report?week=0',
      '/v1/lessons/riyaziyyat-7-1-1',
    ];
    for (const path of paths)
      for (const persona of ['nermin', 'fresh'] as const) {
        const api = await json(path, { headers: { 'x-demo-persona': persona } });
        const local = answerDemo(path, { persona, now: NOW });
        expect(api).toEqual(local);
      }
  });

  it('registers every route of the demo table', async () => {
    const world = buildDemoWorld({ now: NOW, persona: 'nermin' });
    expect(world.lessons.length).toBeGreaterThan(0);
    for (const route of DEMO_ROUTES) {
      const path = route.path.replace(/:[a-zA-Z]+/g, 'x');
      const res = await app.request(path);
      // A route exists when it answers anything but the app's catch-all 404.
      const body = (await res.json()) as { error?: { message?: string } };
      expect(body.error?.message ?? '').not.toBe('Not found');
    }
  });

  it('gives a structured 404 for an unknown id', async () => {
    const { status, body } = await json('/v1/lessons/riyaziyyat-7-9-9');
    expect(status).toBe(404);
    expect(apiErrorSchema.parse(body).error.code).toBe('not_found');
  });

  it('lets the Expo web build call it from another origin', async () => {
    const res = await app.request('/v1/me', {
      method: 'OPTIONS',
      headers: {
        Origin: 'http://localhost:8081',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'x-demo-persona',
      },
    });
    expect(res.headers.get('access-control-allow-origin')).toBe('*');
    expect(res.headers.get('access-control-allow-headers')).toContain('x-demo-persona');
    const lesson = await app.request('/v1/lessons/riyaziyyat-7-4-3', {
      headers: { Origin: 'http://localhost:8081' },
    });
    expect(lesson.headers.get('access-control-allow-origin')).toBe('*');
    expect(studyLessonSchema.parse(await lesson.json()).topicCode).toBe('4.3');
  });
});
