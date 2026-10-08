import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type Anthropic from '@anthropic-ai/sdk';
import { knowledgeExtractionSchema, knowledgeVerificationSchema } from '@mytutor/schemas';
import type { AiCall, ExtractedItem, TopicSource } from '@mytutor/types';
import { callClaude, type ContentPart } from './claude';
import type { GroupResult } from './document';
import { cropBlockOf, cropsFor, groupBlocks, payloadFor, type CallGroup } from './groups';
import { EXTRACT_PROMPT_VERSION, EXTRACT_SYSTEM } from './prompts/extract.v2';
import { VERIFY_PROMPT_VERSION, VERIFY_SYSTEM } from './prompts/verify.v1';
import { fromWire } from './wire';

export type PipelineOptions = {
  client: Anthropic | null;
  topicDir: string;
  cacheDir: string;
  extractModel: string;
  verifyModel: string;
  log: (msg: string) => void;
};

async function cropParts(
  source: TopicSource,
  group: CallGroup,
  topicDir: string,
): Promise<ContentPart[]> {
  const parts: ContentPart[] = [];
  for (const crop of cropsFor(source, group)) {
    const png = await readFile(join(topicDir, crop.path));
    parts.push({ type: 'text', text: `CROP ${crop.blockId}` });
    parts.push({ type: 'image', png, sha256: createHash('sha256').update(png).digest('hex') });
  }
  return parts;
}

/** What the verifier sees for one claim: the content to compare, without the extractor's reasoning. */
function claimOf(item: ExtractedItem, source: TopicSource, group: CallGroup) {
  const blockId = item.sources[0]?.blockId ?? '';
  const { ref, type, origin, sources, readFrom, ...content } = item;
  return { ref, type, blockId, shownIn: `CROP ${cropBlockOf(source, blockId, group)}`, content };
}

/** Extract, then verify the claimed-textbook items of each group against the same crops. */
export async function runKnowledgePipeline(source: TopicSource, opts: PipelineOptions) {
  const results: GroupResult[] = [];
  const calls: AiCall[] = [];
  for (const group of groupBlocks(source)) {
    const crops = await cropParts(source, group, opts.topicDir);
    const sourceText: ContentPart = {
      type: 'text',
      text: `SOURCE:\n${JSON.stringify(payloadFor(source, group))}`,
    };

    const extracted = await callClaude(
      opts.client,
      {
        id: `${group.id}-extract`,
        stage: 'extract',
        model: opts.extractModel,
        effort: 'high',
        promptVersion: EXTRACT_PROMPT_VERSION,
        system: EXTRACT_SYSTEM,
        content: [sourceText, ...crops],
        schema: knowledgeExtractionSchema,
        blockIds: group.blockIds,
      },
      opts.cacheDir,
    );
    calls.push(extracted.call);
    const { items, rejected } = fromWire(extracted.output.items);
    opts.log(
      `${group.id}: ${items.length} element${extracted.call.cached ? ' (cache)' : ''} · ${group.blockIds.join(',')}`,
    );
    for (const r of rejected) opts.log(`  rədd edildi ${r.ref} (${r.type}): ${r.reason}`);

    const claims = items
      .filter((i) => i.origin === 'textbook')
      .map((i) => claimOf(i, source, group));
    let verdicts: GroupResult['verdicts'] = [];
    if (claims.length) {
      const verified = await callClaude(
        opts.client,
        {
          id: `${group.id}-verify`,
          stage: 'verify',
          model: opts.verifyModel,
          effort: 'medium',
          promptVersion: VERIFY_PROMPT_VERSION,
          system: VERIFY_SYSTEM,
          content: [...crops, { type: 'text', text: `CLAIMS:\n${JSON.stringify(claims)}` }],
          schema: knowledgeVerificationSchema,
          blockIds: group.blockIds,
        },
        opts.cacheDir,
      );
      calls.push(verified.call);
      verdicts = verified.output.verdicts;
    }
    results.push({ items, verdicts, rejected: rejected.length });
  }
  return { results, calls };
}
