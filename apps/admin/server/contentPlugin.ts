import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { extname } from 'node:path';
import type { Plugin } from 'vite';
import type { ContentActionErrorCode } from '@mytutor/types';
import { buildContentIndex, resolveContentPath } from './contentIndex';
import {
  addCurriculumTextbook,
  createCurriculum,
  deleteCurriculum,
  removeCurriculumTextbook,
  saveCurriculum,
} from './curricula';
import {
  createStandardSet,
  deleteStandardSet,
  saveStandardSet,
  saveStandardLinks,
} from './standardSets';
import {
  addBook,
  deleteBook,
  extractSource,
  MAX_PDF_BYTES,
  PipelineError,
  purgeTrash,
  restoreBook,
} from './pipeline';
import { decideLessonDraft, estimateLessonTextCost, writeLessonText } from './lessons';
import { saveTopicReview } from './review';
import { addTestBook, deleteTestBook } from './testBooks';

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
const ADD_TEST_BOOK = /^\/test-books\/?$/;
const TEST_BOOK = /^\/test-books\/([^/]+)\/?$/;
const EXTRACT_SOURCE = /^\/books\/([^/]+)\/topics\/([^/]+)\/source\/?$/;
const RESTORE_BOOK = /^\/trash\/([^/]+)\/restore\/?$/;
const TRASH_ENTRY = /^\/trash\/([^/]+)\/?$/;
const CURRICULA = /^\/curricula\/?$/;
const CURRICULUM = /^\/curricula\/([^/]+)\/?$/;
const CURRICULUM_TEXTBOOKS = /^\/curricula\/([^/]+)\/textbooks\/?$/;
const CURRICULUM_TEXTBOOK = /^\/curricula\/([^/]+)\/textbooks\/([^/]+)\/?$/;
const STANDARD_SETS = /^\/standard-sets\/?$/;
const STANDARD_SET = /^\/standard-sets\/([^/]+)\/?$/;
const TOPIC_REVIEW = /^\/books\/([^/]+)\/topics\/([^/]+)\/review\/?$/;
const BOOK_LINKS = /^\/books\/([^/]+)\/standard-links\/?$/;
const LESSON_TEXT =
  /^\/curricula\/([^/]+)\/lessons\/([^/]+)\/([^/]+)\/text(?:\/(estimate|approve|discard))?\/?$/;

/** Standard sets and links are small; anything bigger than this is not what the panel sends. */
export const MAX_JSON_BYTES = 2 * 1024 * 1024;

/** Reads a JSON request body, refusing other types and oversized bodies. */
export async function readJsonBody(req: IncomingMessage): Promise<unknown> {
  const type = req.headers['content-type'] ?? '';
  if (!type.startsWith('application/json'))
    throw new PipelineError(415, 'bad_request', 'Send application/json');
  if (Number(req.headers['content-length'] ?? 0) > MAX_JSON_BYTES)
    throw new PipelineError(413, 'too_large', 'Body is too large');
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk));
    size += buffer.length;
    if (size > MAX_JSON_BYTES) throw new PipelineError(413, 'too_large', 'Body is too large');
    chunks.push(buffer);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw new PipelineError(400, 'bad_request', 'Body is not JSON');
  }
}

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
      if (book) return json(res, 200, await deleteBook({ root, bookId: segment(book[1]) }));
      const testBook = TEST_BOOK.exec(path);
      if (testBook)
        return json(res, 200, await deleteTestBook({ root, testBookId: segment(testBook[1]) }));
      const textbook = CURRICULUM_TEXTBOOK.exec(path);
      if (textbook) {
        const [id, bookId] = [segment(textbook[1]), segment(textbook[2])];
        return json(res, 200, await removeCurriculumTextbook({ root, id, bookId }));
      }
      const curriculum = CURRICULUM.exec(path);
      if (curriculum)
        return json(res, 200, await deleteCurriculum({ root, id: segment(curriculum[1]) }));
      const entry = TRASH_ENTRY.exec(path);
      if (entry) return json(res, 200, await purgeTrash({ root, trashId: segment(entry[1]) }));
      const standardSet = STANDARD_SET.exec(path);
      if (standardSet)
        return json(res, 200, await deleteStandardSet({ root, id: segment(standardSet[1]) }));
      return apiError(res, 404, 'not_found', 'Unknown action');
    }
    const lessonText = LESSON_TEXT.exec(path);
    if (lessonText) {
      const ref = {
        root,
        curriculumId: segment(lessonText[1]),
        bookId: segment(lessonText[2]),
        number: segment(lessonText[3]),
      };
      const step = lessonText[4];
      if (step === 'estimate') return json(res, 200, await estimateLessonTextCost(ref));
      if (step === 'approve' || step === 'discard')
        return json(res, 200, await decideLessonDraft({ ...ref, approve: step === 'approve' }));
      return json(res, 200, await writeLessonText(ref));
    }
    if (CURRICULA.test(path))
      return json(res, 201, await createCurriculum({ root, body: await readJsonBody(req) }));
    const curriculumTextbooks = CURRICULUM_TEXTBOOKS.exec(path);
    if (curriculumTextbooks) {
      const id = segment(curriculumTextbooks[1]);
      const body = await readJsonBody(req);
      return json(res, 200, await addCurriculumTextbook({ root, id, body }));
    }
    const curriculum = CURRICULUM.exec(path);
    if (curriculum) {
      const id = segment(curriculum[1]);
      return json(res, 200, await saveCurriculum({ root, id, body: await readJsonBody(req) }));
    }
    if (STANDARD_SETS.test(path))
      return json(res, 201, await createStandardSet({ root, body: await readJsonBody(req) }));
    const standardSet = STANDARD_SET.exec(path);
    if (standardSet) {
      const id = segment(standardSet[1]);
      return json(res, 200, await saveStandardSet({ root, id, body: await readJsonBody(req) }));
    }
    const review = TOPIC_REVIEW.exec(path);
    if (review) {
      const [bookId, topic] = [segment(review[1]), segment(review[2])];
      const body = await readJsonBody(req);
      return json(res, 200, await saveTopicReview({ root, bookId, topic, body }));
    }
    const links = BOOK_LINKS.exec(path);
    if (links) {
      const bookId = segment(links[1]);
      return json(
        res,
        200,
        await saveStandardLinks({ root, bookId, body: await readJsonBody(req) }),
      );
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
    if (ADD_TEST_BOOK.test(path)) {
      if (Number(req.headers['content-length'] ?? 0) > MAX_PDF_BYTES)
        throw new PipelineError(413, 'too_large', 'PDF is too large');
      const result = await addTestBook({
        root,
        fileName: header(req, 'x-file-name'),
        title: header(req, 'x-book-title'),
        subject: header(req, 'x-subject'),
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
