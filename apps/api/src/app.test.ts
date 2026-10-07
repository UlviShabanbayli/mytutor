import { describe, expect, it } from 'vitest';
import { apiErrorSchema, healthResponseSchema } from '@mytutor/schemas';
import { createApp } from './app';

describe('api', () => {
  const app = createApp();

  it('GET /health returns ok', async () => {
    const res = await app.request('/health');
    expect(res.status).toBe(200);
    expect(healthResponseSchema.parse(await res.json()).status).toBe('ok');
  });

  it('unknown routes return a structured 404', async () => {
    const res = await app.request('/does-not-exist');
    expect(res.status).toBe(404);
    expect(apiErrorSchema.parse(await res.json()).error.code).toBe('not_found');
  });
});
