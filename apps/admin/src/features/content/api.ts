import type { z } from 'zod';
import type { ContentActionErrorCode } from '@mytutor/types';
import {
  addBookResponseSchema,
  apiErrorSchema,
  contentActionErrorCodeSchema,
  contentIndexSchema,
  extractSourceResponseSchema,
  knowledgeDocumentSchema,
  textbookStructureSchema,
  topicSourceSchema,
} from '@mytutor/schemas';

/**
 * Pipeline outputs are served under `/content/` (see server/contentPlugin.ts). Paths in the
 * content index are relative to that root; topic assets are relative to the topic folder.
 */
export function contentUrl(...parts: string[]): string {
  return `/content/${parts
    .flatMap((p) => p.split('/'))
    .filter(Boolean)
    .map(encodeURIComponent)
    .join('/')}`;
}

async function getJson<S extends z.ZodType>(path: string, schema: S): Promise<z.output<S>> {
  const res = await fetch(contentUrl(path));
  if (!res.ok) throw new Error(`${res.status} ${path}`);
  return schema.parse(await res.json());
}

export const fetchContentIndex = () => getJson('index.json', contentIndexSchema);
export const fetchStructure = (path: string) => getJson(path, textbookStructureSchema);
export const fetchTopicSource = (path: string) => getJson(path, topicSourceSchema);
export const fetchKnowledge = (path: string) => getJson(path, knowledgeDocumentSchema);

/** A refused panel action; `code` selects the message shown to the user. */
export class ContentActionError extends Error {
  constructor(
    readonly code: ContentActionErrorCode,
    message: string,
  ) {
    super(message);
  }
}

/** Panel actions are served next to `/content/` (see server/contentPlugin.ts). */
export function actionUrl(...parts: string[]): string {
  return `/content-api/${parts.map(encodeURIComponent).join('/')}`;
}

async function postAction<S extends z.ZodType>(
  parts: string[],
  schema: S,
  init: RequestInit = {},
): Promise<z.output<S>> {
  let res: Response;
  try {
    res = await fetch(actionUrl(...parts), { ...init, method: 'POST' });
  } catch {
    throw new ContentActionError('network', 'Network error');
  }
  const body: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    const parsed = apiErrorSchema.safeParse(body);
    const code = contentActionErrorCodeSchema.safeParse(parsed.data?.error.code);
    throw new ContentActionError(
      code.success ? code.data : 'internal',
      parsed.success ? parsed.data.error.message : `HTTP ${res.status}`,
    );
  }
  return schema.parse(body);
}

/** Uploads a textbook PDF; the server stores it and splits it into units and topics. */
export const addBook = (file: File, title: string) =>
  postAction(['books'], addBookResponseSchema, {
    body: file,
    headers: {
      'Content-Type': 'application/pdf',
      // Header values must be ASCII; the server decodes them.
      'X-File-Name': encodeURIComponent(file.name),
      'X-Book-Title': encodeURIComponent(title),
    },
  });

/** Extracts one topic's source layer from the book's PDF (no AI, a few seconds). */
export const extractTopicSource = (bookId: string, topic: string) =>
  postAction(['books', bookId, 'topics', topic, 'source'], extractSourceResponseSchema);
