import { readFile } from 'node:fs/promises';
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import type { TestsStore } from '../services/publishedTests';

/** The app's test practice: subjects → topics → a test with its questions, and their figures. */
export function testsRoutes(store: TestsStore) {
  const notFound = (what: string) => new HTTPException(404, { message: `${what} not found` });
  return new Hono()
    .get('/subjects', async (c) => c.json(await store.subjects()))
    .get('/subjects/:id', async (c) => {
      const found = await store.subject(c.req.param('id'));
      if (!found) throw notFound('Subject');
      return c.json(found);
    })
    .get('/recommended', async (c) => c.json(await store.recommended()))
    .get('/:id', async (c) => {
      const test = await store.test(c.req.param('id'));
      if (!test) throw notFound('Test');
      return c.json(test);
    });
}

export function mediaRoutes(store: TestsStore) {
  return new Hono().get('/:file', async (c) => {
    const path = await store.media(c.req.param('file'));
    if (!path) throw new HTTPException(404, { message: 'File not found' });
    c.header('Content-Type', 'image/png');
    c.header('Cache-Control', 'public, max-age=3600');
    return c.body(new Uint8Array(await readFile(path)));
  });
}
