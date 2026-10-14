import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { errorHandler, notFoundHandler } from './middleware/error-handler';
import { healthRoutes } from './routes/health';
import { mediaRoutes, testsRoutes } from './routes/tests';
import { publishedTests } from './services/publishedTests';

export type AppOptions = {
  /** Where the published content lives (`.published/` inside it). */
  contentDir: string;
};

export function createApp({ contentDir }: AppOptions) {
  const app = new Hono();
  const tests = publishedTests(contentDir);

  app.use(logger());
  // The app's web build runs on another port; everything here is read-only.
  app.use(cors({ origin: '*', allowMethods: ['GET'] }));
  app.route('/health', healthRoutes);
  app.route('/tests', testsRoutes(tests));
  app.route('/media', mediaRoutes(tests));
  app.notFound(notFoundHandler);
  app.onError(errorHandler);

  return app;
}

export type AppType = ReturnType<typeof createApp>;
