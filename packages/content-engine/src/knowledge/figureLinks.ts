import type {
  ExtractedItem,
  KnowledgeSourceId,
  SourceFigure,
  SourceRegion,
  TopicSource,
} from '@mytutor/types';
import { CONTAINERS } from './groups';
import { pictureNeed } from './pictureRefs';
import { descendants } from './validate';

/** A vector drawing's box and the image around it can differ by a stroke width (points). */
const EDGE = 2;
/** Figures this much nearer or farther still tie. */
const TIE = 2;
/** How far a drawing's printed labels may sit outside its box (points). */
const LABEL_REACH = 12;
/** A bulleted text line ("• mənfi kəsrlər"); the book's text layer keeps the bullet as U+0087. */
const BULLET = /^\s*[•\u0087▪◦‣]\s*\p{L}/u;

type Candidate = { figure: SourceFigure; blockId: string };

// Infinity - Infinity is NaN, so equal distances compare as 0 explicitly.
const cmp = (a: number, b: number) => (a === b ? 0 : a - b);

const contains = (outer: SourceRegion, inner: SourceRegion) =>
  outer.page === inner.page &&
  inner.bbox.x >= outer.bbox.x - EDGE &&
  inner.bbox.y >= outer.bbox.y - EDGE &&
  inner.bbox.x + inner.bbox.width <= outer.bbox.x + outer.bbox.width + EDGE &&
  inner.bbox.y + inner.bbox.height <= outer.bbox.y + outer.bbox.height + EDGE;

const sameRow = (a: SourceRegion, b: SourceRegion) =>
  a.page === b.page && a.bbox.y < b.bbox.y + b.bbox.height && b.bbox.y < a.bbox.y + a.bbox.height;

const touches = (a: SourceRegion, b: SourceRegion, margin: number) =>
  a.page === b.page &&
  a.bbox.x - margin < b.bbox.x + b.bbox.width &&
  b.bbox.x < a.bbox.x + a.bbox.width + margin &&
  a.bbox.y - margin < b.bbox.y + b.bbox.height &&
  b.bbox.y < a.bbox.y + a.bbox.height + margin;

/** [pages apart, vertical gap on the page]; the gap is 0 when the two overlap. */
function distance(region: SourceRegion, near: SourceRegion[]): [number, number] {
  let best: [number, number] = [Infinity, Infinity];
  for (const r of near) {
    const pages = Math.abs(region.page - r.page);
    const gap = pages
      ? Infinity
      : Math.max(
          0,
          Math.max(region.bbox.y, r.bbox.y) -
            Math.min(region.bbox.y + region.bbox.height, r.bbox.y + r.bbox.height),
        );
    if (pages < best[0] || (pages === best[0] && gap < best[1])) best = [pages, gap];
  }
  return best;
}

/** Figures the item cites that exist in the source. */
export const citedFigures = (item: ExtractedItem, source: TopicSource): string[] =>
  item.sources.flatMap((s) =>
    s.figureId && source.figures.some((f) => f.id === s.figureId) ? [s.figureId] : [],
  );

/** Figures of the cited blocks and the blocks inside them, with the block that holds each. */
function candidatesOf(item: ExtractedItem, source: TopicSource): Candidate[] {
  const out: Candidate[] = [];
  for (const s of item.sources) {
    const cited = source.blocks.find((b) => b.id === s.blockId);
    // A Çalışma box lends none of its exercises' drawings: each exercise is its own task.
    const blocks = cited && CONTAINERS.has(cited.kind) ? [cited] : descendants(source, s.blockId);
    for (const block of blocks)
      for (const figure of source.figures)
        if (block.figureIds.includes(figure.id) && !out.some((c) => c.figure === figure))
          out.push({ figure, blockId: block.id });
  }
  // The "Açar sözlər" box is a frame drawn around a bulleted word list, not a picture.
  const wordList = (f: SourceFigure) =>
    source.lines.some((l) => BULLET.test(l.text) && contains(f.region, l.region));
  // A drawing inside another is part of it; an identical box counts once (the lower id stays).
  const inside = (c: Candidate, o: Candidate) =>
    o !== c &&
    contains(o.figure.region, c.figure.region) &&
    (!contains(c.figure.region, o.figure.region) || o.figure.id < c.figure.id);
  const pictures = out.filter((c) => !wordList(c.figure));
  return pictures.filter((c) => !pictures.some((o) => inside(c, o)));
}

/**
 * Source refs for the figures an item's text relies on when the model cited none: the
 * figures of the cited blocks nearest to the item's own lines — same page first, then the
 * smallest vertical gap — with the drawings in the same row (one per sub-item a, b, c, or
 * pieces of one picture). Empty when the item cites a figure, needs none, or its blocks
 * have none.
 */
export function linkFigures(item: ExtractedItem, source: TopicSource): KnowledgeSourceId[] {
  const need = pictureNeed(item);
  if (citedFigures(item, source).length || need.length === 0) return [];

  const lineIds = new Set(item.sources.flatMap((s) => s.lineIds));
  const lineRegions = source.lines.filter((l) => lineIds.has(l.id)).map((l) => l.region);
  const near = lineRegions.length
    ? lineRegions
    : item.sources.flatMap((s) => source.blocks.find((b) => b.id === s.blockId)?.regions ?? []);
  // A table is ruled lines (a vector drawing), never a photo or an illustration.
  const tableOnly = need.every((phrase) => phrase.startsWith('cədvəl'));

  const ranked = candidatesOf(item, source)
    .filter((c) => !tableOnly || c.figure.kind === 'vector')
    // A figure item's lines are the labels printed on its drawing: only a figure at those
    // labels is that drawing, a nearby one is a different picture.
    .filter(
      (c) => item.type !== 'figure' || near.some((r) => touches(c.figure.region, r, LABEL_REACH)),
    )
    .map((c) => ({ ...c, d: distance(c.figure.region, near) }))
    .sort((a, b) => cmp(a.d[0], b.d[0]) || cmp(a.d[1], b.d[1]));
  const best = ranked[0]?.d;
  if (!best) return [];
  const chosen = ranked.filter(({ d }) => d[0] === best[0] && d[1] <= best[1] + TIE);
  for (let grew = true; grew;) {
    const row = ranked.filter(
      (c) => !chosen.includes(c) && chosen.some((k) => sameRow(k.figure.region, c.figure.region)),
    );
    chosen.push(...row);
    grew = row.length > 0;
  }
  // Reading order: rows top to bottom, each row left to right.
  const rows: Candidate[][] = [];
  for (const c of chosen.sort(
    (a, b) =>
      a.figure.region.page - b.figure.region.page ||
      a.figure.region.bbox.y - b.figure.region.bbox.y,
  )) {
    const row = rows.at(-1);
    if (row?.[0] && sameRow(row[0].figure.region, c.figure.region)) row.push(c);
    else rows.push([c]);
  }
  return rows
    .flatMap((row) => row.sort((a, b) => a.figure.region.bbox.x - b.figure.region.bbox.x))
    .map(({ figure, blockId }) => ({ blockId, lineIds: [], figureId: figure.id }));
}
