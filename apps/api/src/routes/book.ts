import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import type { ContentProvider } from '../services/content';

/**
 * Book-derived lesson content, local only: a topic's approved lesson text and the book's
 * answers. Without a content provider (the Worker, a fresh clone) both are 404 and the app shows
 * its demo lesson.
 */
export function bookRoutes(content: ContentProvider | undefined) {
  const notFound = (what: string) => new HTTPException(404, { message: `${what} not found` });
  return new Hono()
    .get('/lessons/:id/book', async (c) => {
      const lesson = await content?.bookLesson(c.req.param('id'));
      if (!lesson) throw notFound('Lesson text');
      return c.json(lesson);
    })
    .get('/lessons/:id/answers', async (c) => {
      const answers = await content?.bookAnswers(c.req.param('id'));
      if (!answers) throw notFound('Book answers');
      return c.json(answers);
    });
}
