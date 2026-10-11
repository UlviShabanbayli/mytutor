import { Hono } from 'hono';
import type { HealthResponse } from '@mytutor/types';

export const healthRoutes = new Hono().get('/', (c) => {
  const body: HealthResponse = { status: 'ok', version: '0.0.0' };
  return c.json(body);
});
