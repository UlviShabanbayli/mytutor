import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { errorHandler, notFoundHandler } from './middleware/error-handler';
import { healthRoutes } from './routes/health';

export function createApp() {
  const app = new Hono();

  app.use(logger());
  app.route('/health', healthRoutes);
  app.notFound(notFoundHandler);
  app.onError(errorHandler);

  return app;
}

export type AppType = ReturnType<typeof createApp>;
