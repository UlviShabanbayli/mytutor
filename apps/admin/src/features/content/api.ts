import type { z } from 'zod';
import {
  contentIndexSchema,
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
