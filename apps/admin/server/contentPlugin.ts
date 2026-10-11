import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { extname } from 'node:path';
import type { Plugin } from 'vite';
import { buildContentIndex, resolveContentPath } from './contentIndex';

const TYPES: Record<string, string> = {
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
};

/**
 * Serves pipeline outputs from disk under `/content/` (dev and preview servers only).
 * Temporary until the API stores sources and knowledge documents; the browser code only
 * knows the `/content/` URLs, so switching to the API changes this plugin, not the UI.
 */
export function contentPlugin(root: string): Plugin {
  const handle = async (req: IncomingMessage, res: ServerResponse) => {
    const url = req.url ?? '/';
    if (url === '/index.json' || url.startsWith('/index.json?')) {
      res.setHeader('Content-Type', TYPES['.json'] ?? '');
      res.setHeader('Cache-Control', 'no-store');
      res.end(JSON.stringify(await buildContentIndex(root)));
      return;
    }
    const path = resolveContentPath(root, url);
    const info = path ? await stat(path).catch(() => null) : null;
    if (!path || !info?.isFile()) {
      // A JSON 404 instead of falling through to the SPA's index.html.
      res.statusCode = 404;
      res.setHeader('Content-Type', TYPES['.json'] ?? '');
      res.end(JSON.stringify({ error: 'not_found' }));
      return;
    }
    res.setHeader('Content-Type', TYPES[extname(path).toLowerCase()] ?? 'application/octet-stream');
    res.setHeader('Cache-Control', 'no-cache');
    createReadStream(path).pipe(res);
  };
  const use = (req: IncomingMessage, res: ServerResponse, next: (err?: unknown) => void) => {
    handle(req, res).catch(next);
  };

  return {
    name: 'mytutor-content',
    configureServer(server) {
      server.middlewares.use('/content', use);
    },
    configurePreviewServer(server) {
      server.middlewares.use('/content', use);
    },
  };
}
