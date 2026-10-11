import type { SourceBlock, SourceBlockKind, SourceRegion, TopicSource } from '@mytutor/types';

/** Colour groups for block overlays and badges; each maps to one theme tone. */
export type BlockCategory = 'explanation' | 'example' | 'box' | 'task' | 'review';

const CATEGORY: Record<SourceBlockKind, BlockCategory> = {
  title: 'explanation',
  inquiry: 'explanation',
  section: 'explanation',
  example: 'example',
  theorem: 'example',
  think: 'box',
  remember: 'box',
  find_mistake: 'box',
  history: 'box',
  exercises: 'task',
  problems: 'task',
  exercise: 'task',
  callout: 'review',
};

export const categoryOf = (kind: SourceBlockKind): BlockCategory => CATEGORY[kind];

/** Containers hold other blocks; their overlays are drawn dashed and behind children. */
export const isContainer = (kind: SourceBlockKind) => kind === 'exercises' || kind === 'problems';

export type BlockNode = { block: SourceBlock; depth: number };

/** Blocks in reading order with their nesting depth (parents before children). */
export function flattenBlockTree(blocks: SourceBlock[]): BlockNode[] {
  const children = new Map<string | null, SourceBlock[]>();
  const ids = new Set(blocks.map((b) => b.id));
  for (const block of blocks) {
    const parent = block.parentId !== null && ids.has(block.parentId) ? block.parentId : null;
    children.set(parent, [...(children.get(parent) ?? []), block]);
  }
  const out: BlockNode[] = [];
  const walk = (parent: string | null, depth: number) => {
    for (const block of children.get(parent) ?? []) {
      out.push({ block, depth });
      walk(block.id, depth + 1);
    }
  };
  walk(null, 0);
  return out;
}

export type PageOverlay = {
  id: string;
  region: SourceRegion;
  category: BlockCategory;
  container: boolean;
};

/** One overlay per block region on the page, containers first so children sit on top. */
export function blockOverlays(source: TopicSource, page: number): PageOverlay[] {
  return source.blocks
    .flatMap((b) =>
      b.regions
        .filter((r) => r.page === page)
        .map((region) => ({
          id: b.id,
          region,
          category: categoryOf(b.kind),
          container: isContainer(b.kind),
        })),
    )
    .sort((a, b) => Number(b.container) - Number(a.container));
}

/** First page a block appears on, used to jump the page viewer to a selected block. */
export const firstPageOf = (block: SourceBlock) => block.regions[0]?.page ?? null;
