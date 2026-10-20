import { describe, expect, it } from 'vitest';
import { apiErrorSchema, studentAssignmentSchema } from '@mytutor/schemas';
import { answerDemo } from '@mytutor/demo-data';
import type { DemoEvent } from '@mytutor/types';
import { createApp } from './app';
import worker from './worker';

const NOW = new Date('2026-10-20T06:00:00.000Z');
const app = createApp({ now: () => NOW });

const graded: DemoEvent = {
  id: 'ev-1',
  at: '2026-10-20T05:30:00.000Z',
  type: 'assignment.graded',
  assignmentId: 'hw-4-1',
  studentId: 'nermin',
  score: 9,
  outOf: 10,
  comment: 'Əla!',
};

const post = (body: unknown, persona = 'nermin', target = app) =>
  target.request('/v1/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-demo-persona': persona },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });

describe('POST /v1/query', () => {
  it('answers like GET path with the events applied', async () => {
    const res = await post({ path: '/v1/assignments/hw-4-1', events: [graded] });
    expect(res.status).toBe(200);
    const hw = studentAssignmentSchema.parse(await res.json());
    expect([hw.submission?.state, hw.submission?.grade]).toEqual([
      'checked',
      { score: 9, max: 10 },
    ]);
    const before = studentAssignmentSchema.parse(
      await (await app.request('/v1/assignments/hw-4-1')).json(),
    );
    expect(before.submission?.state).toBe('submitted');
  });

  it('gives the same JSON as the app’s offline fallback, and as GET without events', async () => {
    for (const path of [
      '/v1/today',
      '/v1/teacher/assignments',
      '/v1/parent/children/nermin/assignments',
    ]) {
      const res = await post({ path, events: [graded] });
      expect({ status: res.status, body: await res.json() }).toEqual(
        answerDemo(path, { persona: 'nermin', now: NOW, events: [graded] }),
      );
      const empty = await post({ path, events: [] });
      expect(await empty.json()).toEqual(await (await app.request(path)).json());
    }
  });

  it('follows the persona header and 404s like GET', async () => {
    const res = await post({ path: '/v1/assignments/hw-4-1', events: [graded] }, 'fresh');
    expect(res.status).toBe(404);
    expect(apiErrorSchema.parse(await res.json()).error.code).toBe('not_found');
  });

  it('refuses bad bodies, its own path, too many events and too many bytes', async () => {
    expect((await post('not json')).status).toBe(400);
    expect((await post({ path: '/tests/subjects', events: [] })).status).toBe(400);
    expect((await post({ path: '/v1/query', events: [] })).status).toBe(400);
    expect((await post({ path: '/v1/me', events: [{ type: 'nope' }] })).status).toBe(400);
    const many = Array.from({ length: 201 }, (_, i) => ({ ...graded, id: `ev-${i}` }));
    expect((await post({ path: '/v1/me', events: many })).status).toBe(400);
    const big = { path: '/v1/me', events: [{ ...graded, comment: 'x'.repeat(300 * 1024) }] };
    const res = await post(big);
    expect(res.status).toBe(413);
    expect(apiErrorSchema.parse(await res.json()).error.code).toBe('payload_too_large');
  });

  it('works on the Worker entry and from the Expo web origin', async () => {
    const res = await post({ path: '/v1/assignments/hw-4-1', events: [graded] }, 'nermin', worker);
    expect(studentAssignmentSchema.parse(await res.json()).submission?.state).toBe('checked');
    const preflight = await app.request('/v1/query', {
      method: 'OPTIONS',
      headers: {
        Origin: 'http://localhost:8081',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'content-type,x-demo-persona',
      },
    });
    expect(preflight.headers.get('access-control-allow-methods')).toContain('POST');
  });
});
