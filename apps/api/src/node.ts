import { serve } from '@hono/node-server';
import { loadEnv } from './env';
import { createNodeApp } from './nodeApp';

// The dev and start entry: `pnpm --filter @mytutor/api dev` (port 4000 by default).
const env = loadEnv();
const { app, hasContent } = createNodeApp({ contentDir: env.CONTENT_DIR });

serve({ fetch: app.fetch, port: env.PORT }, (info) => {
  console.log(`API listening on http://localhost:${info.port}`);
  console.log(
    hasContent
      ? `Book content from ${env.CONTENT_DIR} (local only)`
      : 'No content folder: serving the demo world only',
  );
});
