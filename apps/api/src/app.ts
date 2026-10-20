import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { PERSONA_HEADER, buildDemoWorld } from '@mytutor/demo-data';
import { errorHandler, notFoundHandler } from './middleware/error-handler';
import { bookRoutes } from './routes/book';
import { demoRoutes, type WorldFactory } from './routes/demo';
import { healthRoutes } from './routes/health';
import { queryRoutes } from './routes/query';
import { mediaRoutes, testsRoutes } from './routes/tests';
import { noTests, type ContentProvider } from './services/content';

export type AppOptions = {
  /** Builds the demo world per request (default: `buildDemoWorld`). */
  world?: WorldFactory;
  /** Book-derived content; only the local Node entry has it. */
  content?: ContentProvider;
  /** The request's time (tests pin it). */
  now?: () => Date;
};

/**
 * One app for two runtimes: the Node entry (local, with the content folder) and the Worker
 * entry (demo world only). Nothing here imports Node and nothing is stored: writes arrive as
 * demo events with each query (`POST /v1/query`).
 */
export function createApp({
  world = buildDemoWorld,
  content,
  now = () => new Date(),
}: AppOptions = {}) {
  const app = new Hono();

  app.use(logger());
  // The Expo web build runs on another origin, and the demo is open to everyone: any origin.
  app.use(
    cors({
      origin: '*',
      allowMethods: ['GET', 'POST', 'OPTIONS'],
      allowHeaders: [PERSONA_HEADER, 'Content-Type'],
      maxAge: 600,
    }),
  );
  app.route('/health', healthRoutes);
  app.route('/v1', bookRoutes(content));
  app.route('/v1', queryRoutes(world, now));
  app.route('/v1', demoRoutes(world, now));
  app.route('/tests', testsRoutes(content?.tests ?? noTests));
  app.route('/media', mediaRoutes(content?.tests ?? noTests));
  app.notFound(notFoundHandler);
  app.onError(errorHandler);

  return app;
}

export type AppType = ReturnType<typeof createApp>;
