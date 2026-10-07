import { serve } from '@hono/node-server';
import { createApp } from './app';
import { loadEnv } from './env';

const env = loadEnv();
const app = createApp();

serve({ fetch: app.fetch, port: env.PORT }, (info) => {
  console.log(`API listening on http://localhost:${info.port}`);
});
