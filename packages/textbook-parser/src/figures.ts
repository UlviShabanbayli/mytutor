import type { BBox } from '@mytutor/types';
import type { PageGraphics, PagePath } from './graphics';

export type DraftFigure = { page: number; kind: 'image' | 'vector'; bbox: BBox };

const GAP = 8; // paths closer than this belong to one drawing
const MIN_W = 36;
const MIN_H = 26;
const MAX_TEXT_SHARE = 0.3;
const ROW_GAP = 40;

const sameRow = (a: BBox, b: BBox) => {
  const overlap = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);
  return overlap >= Math.min(a.height, b.height) * 0.5;
};
const horizontalGap = (a: BBox, b: BBox) =>
  Math.max(a.x, b.x) - Math.min(a.x + a.width, b.x + b.width);

const intersection = (a: BBox, b: BBox) =>
  Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x)) *
  Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y));

const overlaps = (a: BBox, b: BBox, pad = 0) =>
  a.x - pad <= b.x + b.width &&
  b.x - pad <= a.x + a.width &&
  a.y - pad <= b.y + b.height &&
  b.y - pad <= a.y + a.height;

const union = (a: BBox, b: BBox): BBox => {
  const x = Math.min(a.x, b.x);
  const y = Math.min(a.y, b.y);
  return {
    x,
    y,
    width: Math.max(a.x + a.width, b.x + b.width) - x,
    height: Math.max(a.y + a.height, b.y + b.height) - y,
  };
};

/** Wide filled shapes are layout panels (formula boxes, tables, page bands), not drawings. */
function isPanel(p: PagePath, contentWidth: number): boolean {
  return p.filled && p.bbox.width > contentWidth * 0.45;
}

/**
 * Figures inside a vertical window: raster images that are not template icons, and clusters
 * of vector paths big enough to be a drawing (diagrams, geometric figures).
 */
export function findFigures(
  g: PageGraphics,
  window: { top: number; bottom: number },
  page: { width: number; height: number },
  exclude: BBox[],
  text: BBox[] = [],
): DraftFigure[] {
  const inWindow = (b: BBox) => b.y >= window.top - 2 && b.y + b.height <= window.bottom + 2;
  const excluded = (b: BBox) => exclude.some((e) => overlaps(e, b));
  const contentWidth = page.width * 0.8;

  const images = g.images
    .filter(
      (i) => inWindow(i.bbox) && !excluded(i.bbox) && i.bbox.width >= 24 && i.bbox.height >= 24,
    )
    .map((i) => ({ page: g.page, kind: 'image' as const, bbox: i.bbox }));

  const strokes = g.paths.filter(
    (p) =>
      inWindow(p.bbox) &&
      !excluded(p.bbox) &&
      !isPanel(p, contentWidth) &&
      p.bbox.width < page.width * 0.9 &&
      !(p.bbox.height < 2 && p.bbox.width > 200),
  );
  const clusters: { bbox: BBox; count: number }[] = [];
  for (const p of strokes) {
    const hit = clusters.find((c) => overlaps(c.bbox, p.bbox, GAP));
    if (hit) {
      hit.bbox = union(hit.bbox, p.bbox);
      hit.count++;
    } else clusters.push({ bbox: p.bbox, count: 1 });
  }
  // Merging can make clusters touch; merge until stable.
  for (let changed = true; changed;) {
    changed = false;
    for (let i = 0; i < clusters.length && !changed; i++) {
      for (let j = i + 1; j < clusters.length && !changed; j++) {
        const a = clusters[i];
        const b = clusters[j];
        if (a && b && overlaps(a.bbox, b.bbox, GAP)) {
          a.bbox = union(a.bbox, b.bbox);
          a.count += b.count;
          clusters.splice(j, 1);
          changed = true;
        }
      }
    }
  }
  // Parts of one drawing laid out in a row (shape → arrow → shape) belong together.
  for (let changed = true; changed;) {
    changed = false;
    for (let i = 0; i < clusters.length && !changed; i++) {
      for (let j = i + 1; j < clusters.length && !changed; j++) {
        const a = clusters[i];
        const b = clusters[j];
        if (a && b && sameRow(a.bbox, b.bbox) && horizontalGap(a.bbox, b.bbox) <= ROW_GAP) {
          a.bbox = union(a.bbox, b.bbox);
          a.count += b.count;
          clusters.splice(j, 1);
          changed = true;
        }
      }
    }
  }

  // Clusters mostly covered by text are formula decorations or answer cells, not drawings.
  const textShare = (b: BBox) => {
    const area = b.width * b.height || 1;
    const covered = text
      .filter((t) => overlaps(t, b))
      .reduce((sum, t) => sum + intersection(t, b), 0);
    return covered / area;
  };
  const vectors = clusters
    .filter(
      (c) =>
        c.count >= 3 &&
        c.bbox.width >= MIN_W &&
        c.bbox.height >= MIN_H &&
        textShare(c.bbox) < MAX_TEXT_SHARE,
    )
    .map((c) => ({ page: g.page, kind: 'vector' as const, bbox: c.bbox }));

  return [...images, ...vectors].sort((a, b) => a.bbox.y - b.bbox.y || a.bbox.x - b.bbox.x);
}

export { overlaps };
