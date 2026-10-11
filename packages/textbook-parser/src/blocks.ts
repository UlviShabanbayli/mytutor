import type { SourceBlockKind } from '@mytutor/types';
import type { Marker } from './markers';
import type { SideBox } from './template';

/** A position in the topic: page plus distance from the top of the page (points). */
export type Pos = { page: number; top: number };

export type DraftBlock = {
  kind: SourceBlockKind;
  label: string | null;
  title: string | null;
  number: string | null;
  parent: DraftBlock | null;
  /** Spans in reading order; a block interrupted by another box resumes in a new span. */
  spans: { from: Pos; to: Pos }[];
  /** Set for side boxes: the block is their panel, not a full-width span of the column. */
  box?: SideBox;
};

const TOP_LEVEL: SourceBlockKind[] = [
  'title',
  'inquiry',
  'section',
  'think',
  'remember',
  'find_mistake',
  'history',
  'keywords',
  'exercises',
  'problems',
  'callout',
];
const CONTAINERS: SourceBlockKind[] = ['exercises', 'problems'];
const LEAVES: SourceBlockKind[] = ['example', 'theorem']; // never hold other blocks

const before = (a: Pos, b: Pos) => a.page < b.page || (a.page === b.page && a.top < b.top);

/** Multi-line headings arrive as several markers of the same kind right below each other. */
export function mergeMarkers(markers: Marker[]): Marker[] {
  const out: Marker[] = [];
  for (const m of markers) {
    const prev = out.at(-1);
    const continues =
      prev &&
      (m.kind === 'title' || m.kind === 'section') &&
      prev.kind === m.kind &&
      prev.page === m.page &&
      m.top - prev.top < 30 &&
      m.title &&
      prev.title;
    if (continues) prev.title = `${prev.title} ${m.title}`;
    else out.push({ ...m });
  }
  return out;
}

/**
 * Turns markers into a block tree with spans. Top-level boxes close each other; exercises
 * live in the last Çalışma/Məsələ həlli container (re-opened after an interrupting box, as
 * the book numbers exercises across boxes); NÜMUNƏ and Teorem belong to the block around them.
 */
export function buildBlocks(markers: Marker[], start: Pos, end: Pos): DraftBlock[] {
  const blocks: DraftBlock[] = [];
  const open: DraftBlock[] = []; // stack: top-level → exercise → example
  let lastContainer: DraftBlock | null = null;

  const close = (depth: number, at: Pos) => {
    while (open.length > depth) {
      const b = open.pop();
      const span = b?.spans.at(-1);
      if (span) span.to = at;
    }
  };
  const openBlock = (b: DraftBlock, at: Pos) => {
    b.spans.push({ from: at, to: end });
    open.push(b);
  };
  const create = (m: Marker, parent: DraftBlock | null): DraftBlock => {
    const b: DraftBlock = {
      kind: m.kind,
      label: m.label,
      title: m.title,
      number: m.number,
      parent,
      spans: [],
    };
    blocks.push(b);
    return b;
  };

  for (const m of mergeMarkers(markers)) {
    const at = { page: m.page, top: m.top };
    if (before(at, start) || !before(at, end)) continue;

    if (TOP_LEVEL.includes(m.kind)) {
      close(0, at);
      const b = create(m, null);
      openBlock(b, at);
      if (CONTAINERS.includes(m.kind)) lastContainer = b;
    } else if (m.kind === 'exercise') {
      const top = open[0];
      if (!top || !CONTAINERS.includes(top.kind)) {
        // An exercise after a box: the numbering continues the last container.
        close(0, at);
        const container: DraftBlock =
          lastContainer ?? create({ ...m, kind: 'exercises', label: null, number: null }, null);
        lastContainer = container;
        openBlock(container, at);
      } else {
        close(1, at);
      }
      openBlock(create(m, open[0] ?? null), at);
    } else {
      // example / theorem: child of the innermost exercise or top-level block.
      const parentDepth = open.length >= 2 && open[1]?.kind === 'exercise' ? 2 : 1;
      close(parentDepth, at);
      const parent = open[parentDepth - 1] ?? null;
      openBlock(create(m, parent), at);
    }
  }
  close(0, end);
  return blocks;
}

const depth = (b: DraftBlock): number => (b.parent ? depth(b.parent) + 1 : 0);

/**
 * Adds side boxes in reading order, each after the block open at its top. A NÜMUNƏ or Teorem
 * box is a child of that block, like its full-width form. Never before the first block: a box
 * at the top of the page can start level with the topic heading.
 */
export function withSideBoxes(blocks: DraftBlock[], boxes: SideBox[]): DraftBlock[] {
  const out = [...blocks];
  for (const x of [...boxes].sort((a, b) => a.page - b.page || a.bbox.y - b.bbox.y)) {
    const at = { page: x.page, top: x.bbox.y };
    const open = out.filter(
      (b) =>
        !b.box &&
        !LEAVES.includes(b.kind) &&
        b.spans.some((s) => !before(at, s.from) && before(at, s.to)),
    );
    // An exercise printed in a box of its own belongs to the exercise list, not to the
    // exercise above it.
    const parent = TOP_LEVEL.includes(x.kind)
      ? null
      : x.kind === 'exercise'
        ? (open.filter((b) => CONTAINERS.includes(b.kind)).at(-1) ?? null)
        : (open.at(-1) ?? null);
    const level = parent ? depth(parent) + 1 : 0;
    const next = out.findIndex(
      (b, i) => i > 0 && depth(b) <= level && !!b.spans[0] && before(at, b.spans[0].from),
    );
    out.splice(next === -1 ? out.length : next, 0, {
      kind: x.kind,
      label: x.label,
      title: null,
      number: x.number,
      parent,
      spans: [{ from: at, to: { page: x.page, top: x.bbox.y + x.bbox.height } }],
      box: x,
    });
  }
  return out;
}
