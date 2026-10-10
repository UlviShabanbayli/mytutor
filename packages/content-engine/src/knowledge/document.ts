import { createHash } from 'node:crypto';
import { KNOWLEDGE_EXTRACTION_VERSION, knowledgeDocumentSchema } from '@mytutor/schemas';
import type {
  AiCall,
  ExtractedItem,
  KnowledgeDocument,
  KnowledgeItem,
  KnowledgeSourceRef,
  TopicSource,
  VerificationVerdict,
} from '@mytutor/types';
import { EXTRACT_PROMPT_VERSION, EXTRACT_SYSTEM } from './prompts/extract.v2';
import { VERIFY_PROMPT_VERSION, VERIFY_SYSTEM } from './prompts/verify.v1';
import { canonicalSha256 } from './canonical';
import { checkItem, statusOf } from './validate';

const sha = (s: string) => createHash('sha256').update(s).digest('hex');

/** Location comes from the source layer: lines' regions when cited, else the figure's, else the block's. */
export function resolveSources(item: ExtractedItem, source: TopicSource): KnowledgeSourceRef[] {
  return item.sources.map((s) => {
    const block = source.blocks.find((b) => b.id === s.blockId);
    const lines = s.lineIds
      .map((id) => source.lines.find((l) => l.id === id))
      .filter((l) => l !== undefined);
    const figure = s.figureId ? source.figures.find((f) => f.id === s.figureId) : undefined;
    const regions = lines.length
      ? lines.map((l) => l.region)
      : figure
        ? [figure.region]
        : (block?.regions ?? []);
    return {
      ...s,
      regions: regions.length ? regions : (block?.regions ?? []),
      // The block crop shows the printed text; a cited figure is added, not substituted.
      crops: [...new Set([...(block?.crops ?? []), ...(figure ? [figure.image] : [])])],
    };
  });
}

export type GroupResult = {
  items: ExtractedItem[];
  verdicts: VerificationVerdict[];
  /** Model items rejected by `fromWire` (fields did not fit their type). */
  rejected: number;
};

export function buildDocument(
  source: TopicSource,
  sourceJson: string,
  groups: GroupResult[],
  aiCalls: AiCall[],
): KnowledgeDocument {
  let n = 0;
  const items: KnowledgeItem[] = groups.flatMap((g) =>
    g.items.map((item) => {
      const verdict = g.verdicts.find((v) => v.ref === item.ref);
      const checks = checkItem(item, source, verdict);
      const { type, ref, origin, sources, readFrom, ...content } = item;
      n += 1;
      return {
        id: `k${String(n).padStart(3, '0')}`,
        type,
        status: statusOf(item, checks),
        claimedOrigin: origin,
        readFrom,
        sources: resolveSources(item, source),
        content,
        checks,
      };
    }),
  );

  const lowBlocks = new Set(source.blocks.filter((b) => b.flags.lowTextQuality).map((b) => b.id));
  const imageBasedFormulas = items
    .filter(
      (i) =>
        i.type === 'formula' &&
        (i.readFrom === 'image' || i.sources.some((s) => lowBlocks.has(s.blockId))),
    )
    .map((i) => String(i.content.latex ?? ''));

  return knowledgeDocumentSchema.parse({
    schemaVersion: 1,
    extractionVersion: KNOWLEDGE_EXTRACTION_VERSION,
    topic: { number: source.topic.number, title: source.topic.title },
    source: {
      bookSha256: source.book.sha256,
      parserVersion: source.parserVersion,
      sourceSha256: canonicalSha256(JSON.parse(sourceJson)),
    },
    prompts: {
      extract: EXTRACT_PROMPT_VERSION,
      verify: VERIFY_PROMPT_VERSION,
      extractSha256: sha(EXTRACT_SYSTEM),
      verifySha256: sha(VERIFY_SYSTEM),
    },
    createdAt: new Date().toISOString(),
    items,
    aiCalls,
    summary: {
      textbook: items.filter((i) => i.status === 'textbook').length,
      derived: items.filter((i) => i.status === 'derived').length,
      unverified: items.filter((i) => i.status === 'unverified').length,
      imageBasedFormulas,
      rejected: groups.reduce((n, g) => n + g.rejected, 0),
      costUsd: Math.round(aiCalls.reduce((s, c) => s + c.costUsd, 0) * 10000) / 10000,
    },
  });
}
