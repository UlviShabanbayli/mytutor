import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { extname } from 'node:path';
import type { Plugin } from 'vite';
import type { ContentActionErrorCode } from '@mytutor/types';
import { buildContentIndex, resolveContentPath } from './contentIndex';
import {
  addBook,
  deleteBook,
  extractSource,
  MAX_PDF_BYTES,
  PipelineError,
  restoreBook,
} from './pipeline';

const TYPES: Record<string, string> = {
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
};

const json = (res: ServerResponse, status: number, body: unknown) => {
  res.statusCode = status;
  res.setHeader('Content-Type', TYPES['.json'] ?? '');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
};

const apiError = (
  res: ServerResponse,
  status: number,
  code: ContentActionErrorCode,
  message: string,
) => json(res, status, { error: { code, message } });

/**
 * Actions change files on this machine, so only the panel itself may call them: browsers send
 * `Origin` (and `Sec-Fetch-Site`) on cross-site POSTs, and those are refused.
 */
export function isSameOrigin(req: IncomingMessage): boolean {
  const site = req.headers['sec-fetch-site'];
  if (site && site !== 'same-origin') return false;
  const origin = req.headers.origin;
  if (!origin) return true;
  try {
    return new URL(origin).host === req.headers.host;
  } catch {
    return false;
  }
}

const header = (req: IncomingMessage, name: string) => {
  const value = req.headers[name];
  try {
    return typeof value === 'string' ? decodeURIComponent(value) : '';
  } catch {
    return '';
  }
};

// Actions live outside /content/ so no book folder name can shadow them.
export const ACTIONS_BASE = '/content-api';
const ADD_BOOK = /^\/books\/?$/;
const BOOK = /^\/books\/([^/]+)\/?$/;
const EXTRACT_SOURCE = /^\/books\/([^/]+)\/topics\/([^/]+)\/source\/?$/;
const RESTORE_BOOK = /^\/trash\/([^/]+)\/restore\/?$/;

/** A path segment, or "" when it is not valid percent-encoding (then nothing matches it). */
const segment = (value: string | undefined) => {
  try {
    return decodeURIComponent(value ?? '');
  } catch {
    return '';
  }
};

/**
 * Serves pipeline outputs from disk under `/content/` and runs the panel's actions
 * (`/content-api/…`) on the dev and preview servers only. Temporary until the API stores
 * sources and knowledge documents; the browser only knows these URLs, so switching to the API
 * changes this plugin, not the UI.
 */
export function contentPlugin(root: string): Plugin {
  const handleAction = async (req: IncomingMessage, res: ServerResponse, path: string) => {
    if (!isSameOrigin(req)) return apiError(res, 403, 'forbidden', 'Cross-site request');
    if (req.method === 'DELETE') {
      const book = BOOK.exec(path);
      if (!book) return apiError(res, 404, 'not_found', 'Unknown action');
      return json(res, 200, await deleteBook({ root, bookId: segment(book[1]) }));
    }
    if (ADD_BOOK.test(path)) {
      // Refuse an oversized upload before reading it, instead of after 300 MB.
      if (Number(req.headers['content-length'] ?? 0) > MAX_PDF_BYTES)
        throw new PipelineError(413, 'too_large', 'PDF is too large');
      const result = await addBook({
        root,
        fileName: header(req, 'x-file-name'),
        title: header(req, 'x-book-title'),
        body: req,
      });
      return json(res, 201, result);
    }
    const match = EXTRACT_SOURCE.exec(path);
    if (match) {
      const result = await extractSource({
        root,
        bookId: segment(match[1]),
        topic: segment(match[2]),
      });
      return json(res, 200, result);
    }
    const restore = RESTORE_BOOK.exec(path);
    if (restore) return json(res, 200, await restoreBook({ root, trashId: segment(restore[1]) }));
    return apiError(res, 404, 'not_found', 'Unknown action');
  };

  const actions = async (req: IncomingMessage, res: ServerResponse) => {
    const path = (req.url ?? '/').split('?')[0] ?? '/';
    if (req.method !== 'POST' && req.method !== 'DELETE')
      return apiError(res, 405, 'method', 'Use POST or DELETE');
    try {
      return await handleAction(req, res, path);
    } catch (error) {
      // Drain an upload the action refused early, and close the connection afterwards, so the
      // client gets the answer instead of a stalled or reset request.
      if (!req.readableEnded) {
        res.setHeader('Connection', 'close');
        req.resume();
      }
      if (error instanceof PipelineError)
        return apiError(res, error.status, error.code, error.message);
      throw error;
    }
  };

  const content = async (req: IncomingMessage, res: ServerResponse) => {
    const url = req.url ?? '/';
    const path = url.split('?')[0] ?? '/';
    if (path === '/index.json') return json(res, 200, await buildContentIndex(root));
    const file = resolveContentPath(root, url);
    const info = file ? await stat(file).catch(() => null) : null;
    if (!file || !info?.isFile()) {
      // A JSON 404 instead of falling through to the SPA's index.html.
      return apiError(res, 404, 'not_found', 'No such file');
    }
    res.setHeader('Content-Type', TYPES[extname(file).toLowerCase()] ?? 'application/octet-stream');
    res.setHeader('Cache-Control', 'no-cache');
    createReadStream(file).pipe(res);
  };

  const using =
    (handler: (req: IncomingMessage, res: ServerResponse) => Promise<void>) =>
    (req: IncomingMessage, res: ServerResponse, next: (err?: unknown) => void) => {
      handler(req, res).catch((error: unknown) => {
        if (res.headersSent) return next(error);
        apiError(res, 500, 'internal', error instanceof Error ? error.message : String(error));
      });
    };

  return {
    name: 'mytutor-content',
    configureServer(server) {
      server.middlewares.use('/content', using(content));
      server.middlewares.use(ACTIONS_BASE, using(actions));
    },
    configurePreviewServer(server) {
      server.middlewares.use('/content', using(content));
      server.middlewares.use(ACTIONS_BASE, using(actions));
    },
  };
}
