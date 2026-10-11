import type { SourceBlock, TopicSource } from '@mytutor/types';

/** One AI call's worth of blocks. Groups are deterministic so results can be cached per group. */
export type CallGroup = { id: string; blockIds: string[] };

const CONTAINERS = new Set(['exercises', 'problems']);
const EXERCISES_PER_CALL = 6;
const SMALL_BOX_LINES = 6;

const subtree = (blocks: SourceBlock[], rootId: string): string[] => {
  const ids = [rootId];
  for (const b of blocks) if (b.parentId && ids.includes(b.parentId)) ids.push(b.id);
  return ids;
};

/**
 * Splits a topic into call groups following its layout: each explanation box with the small
 * boxes after it, and exercise containers in chunks of a few exercises (with their NÜMUNƏ).
 * The topic title carries no knowledge of its own and is not sent.
 */
export function groupBlocks(source: TopicSource): CallGroup[] {
  const groups: CallGroup[] = [];
  const add = (blockIds: string[]) => groups.push({ id: `g${groups.length + 1}`, blockIds });
  let pending: string[] = [];
  const flush = () => {
    if (pending.length) add(pending);
    pending = [];
  };

  for (const b of source.blocks.filter((x) => x.parentId === null && x.kind !== 'title')) {
    if (CONTAINERS.has(b.kind)) {
      flush();
      const children = source.blocks.filter((c) => c.parentId === b.id && c.kind === 'exercise');
      for (let i = 0; i < Math.max(children.length, 1); i += EXERCISES_PER_CALL) {
        const chunk = children
          .slice(i, i + EXERCISES_PER_CALL)
          .flatMap((c) => subtree(source.blocks, c.id));
        // The container's own label line travels with its first chunk.
        add(i === 0 ? [b.id, ...chunk] : chunk);
      }
      continue;
    }
    const ids = subtree(source.blocks, b.id);
    const small = ids.length === 1 && b.lineIds.length <= SMALL_BOX_LINES;
    // A small box (e.g. Fikirləş!) joins the explanation it follows; anything else starts a group.
    if (!(small && pending.length)) flush();
    pending.push(...ids);
  }
  flush();
  // Reading order: a group sits where its first non-container block is printed.
  const order = new Map(source.blocks.map((b, i) => [b.id, i]));
  const position = (g: CallGroup) =>
    Math.min(
      ...g.blockIds
        .filter((id) => !CONTAINERS.has(source.blocks[order.get(id) ?? 0]?.kind ?? ''))
        .map((id) => order.get(id) ?? 0),
    );
  return groups
    .sort((a, b) => position(a) - position(b))
    .map((g, i) => ({ ...g, id: `g${i + 1}` }));
}

/** The block whose crop shows `blockId`: itself, or the nearest ancestor that is not a container. */
export function cropBlockOf(source: TopicSource, blockId: string, group: CallGroup): string {
  let b = source.blocks.find((x) => x.id === blockId);
  while (b?.parentId && group.blockIds.includes(b.parentId)) {
    const parent = source.blocks.find((x) => x.id === b?.parentId);
    if (!parent || CONTAINERS.has(parent.kind)) break;
    b = parent;
  }
  return b?.id ?? blockId;
}

/** The SOURCE JSON a call sees: its blocks with lines and figure labels, and nothing else. */
export function payloadFor(source: TopicSource, group: CallGroup) {
  const lineById = new Map(source.lines.map((l) => [l.id, l]));
  const figById = new Map(source.figures.map((f) => [f.id, f]));
  return {
    topic: {
      number: source.topic.number,
      title: source.topic.title,
      unit: source.topic.unit.title,
    },
    blocks: group.blockIds.map((id) => {
      const b = source.blocks.find((x) => x.id === id);
      if (!b) throw new Error(`Block ${id} not in source`);
      return {
        id: b.id,
        kind: b.kind,
        label: b.label,
        title: b.title,
        number: b.number,
        parentId: b.parentId,
        page: b.regions[0]?.printedPage ?? null,
        crop: CONTAINERS.has(b.kind) ? null : cropBlockOf(source, b.id, group),
        lines: b.lineIds.map((lid) => {
          const l = lineById.get(lid);
          return {
            id: lid,
            text: l?.text ?? '',
            math: l?.math ?? false,
            quality: l?.quality ?? 'low',
          };
        }),
        figures: b.figureIds.map((fid) => ({ id: fid, labels: figById.get(fid)?.labels ?? [] })),
      };
    }),
  };
}

/** Crops to attach: one per block that shows itself (children are inside their parent's crop). */
export function cropsFor(
  source: TopicSource,
  group: CallGroup,
): { blockId: string; path: string }[] {
  return group.blockIds.flatMap((id) => {
    const b = source.blocks.find((x) => x.id === id);
    if (!b || CONTAINERS.has(b.kind) || cropBlockOf(source, id, group) !== id) return [];
    return b.crops.map((path) => ({ blockId: b.id, path }));
  });
}
