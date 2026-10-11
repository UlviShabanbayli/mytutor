import type { BBox, SourceBlockKind } from '@mytutor/types';
import { centerInside, union } from './assign';
import type { PageGraphics, PagePath } from './graphics';

/**
 * Visual markers of the TRİMS textbook template (InDesign, 2024+ editions).
 * Several labels are drawn as vector badges or icons, not text, so they are recognised by
 * their fill colour/size or by the intrinsic pixel sizes of their icon images.
 * Each signature was checked against crops of the book (see PR description).
 */

type BadgeSignature = {
  kind: SourceBlockKind;
  label: string;
  fill: string;
  width: [number, number];
  height: [number, number];
};
/** An icon matches when all of its characteristic image sizes are present. */
type IconSignature = { kind: SourceBlockKind; label: string; pixels: string[] };

const matchesBadge = (b: BadgeSignature, p: PagePath) =>
  b.fill === p.fill &&
  p.bbox.width >= b.width[0] &&
  p.bbox.width <= b.width[1] &&
  p.bbox.height >= b.height[0] &&
  p.bbox.height <= b.height[1];

const BADGES: BadgeSignature[] = [
  { kind: 'section', label: 'Öyrənmə', fill: '#2faca9', width: [45, 70], height: [14, 22] },
  { kind: 'think', label: 'Fikirləş!', fill: '#7e9640', width: [45, 70], height: [12, 20] },
  { kind: 'problems', label: 'Məsələ həlli', fill: '#ff636f', width: [75, 110], height: [10, 17] },
  {
    kind: 'find_mistake',
    label: 'Səhvi düzəlt!',
    fill: '#4bb984',
    width: [75, 110],
    height: [10, 18],
  },
  {
    kind: 'history',
    label: 'Riyaziyyat tarixindən',
    fill: '#e9eb9e',
    width: [140, 175],
    height: [13, 21],
  },
];

/** Icons are stacks of small images; the signature is their pixel sizes in paint order. */
const ICONS: IconSignature[] = [
  { kind: 'remember', label: 'Yadda saxla!', pixels: ['26x37', '17x29'] },
  { kind: 'think', label: 'Fikirləş!', pixels: ['32x37', '27x11'] },
];

/**
 * Labels that are real text in the PDF, matched against the repaired line text. `label` is
 * the canonical printed form (the text layer sometimes drops a final glyph, e.g. "müzakir").
 */
export const TEXT_LABELS: { kind: SourceBlockKind; pattern: RegExp; label: string }[] = [
  { kind: 'inquiry', pattern: /^Araşdırma-müzakir/, label: 'Araşdırma-müzakirə' },
  { kind: 'exercises', pattern: /^Çalışma$/, label: 'Çalışma' },
  { kind: 'remember', pattern: /^Yadda saxla!?$/, label: 'Yadda saxla!' },
  { kind: 'example', pattern: /^NÜMUNƏ(?:\s*(\d+)\.)?/, label: 'NÜMUNƏ' },
  { kind: 'theorem', pattern: /^Teorem\s+(\d+)\./, label: 'Teorem' },
];

export type GraphicMarker = {
  kind: SourceBlockKind;
  label: string;
  page: number;
  x: number;
  y: number;
  height: number;
};

const LEFT_ZONE = 160; // badges and icons sit in the left part of the text column

/** Unknown coloured pills in the left zone are reported as `callout` so a person checks them. */
export function findGraphicMarkers(g: PageGraphics): GraphicMarker[] {
  const markers: GraphicMarker[] = [];
  for (const p of g.paths) {
    const { x, y, height } = p.bbox;
    if (!p.filled || x > LEFT_ZONE || p.fill === '#ffffff') continue;
    const badge = BADGES.find((b) => matchesBadge(b, p));
    if (badge) markers.push({ kind: badge.kind, label: badge.label, page: g.page, x, y, height });
  }

  // Group images painted at (nearly) the same spot into one icon.
  const used = new Set<number>();
  g.images.forEach((img, i) => {
    if (used.has(i) || img.bbox.x > LEFT_ZONE) return;
    const group = g.images.filter((o, j) => {
      const near = Math.abs(o.bbox.x - img.bbox.x) < 8 && Math.abs(o.bbox.y - img.bbox.y) < 12;
      if (near) used.add(j);
      return near;
    });
    const pixels = new Set(group.map((o) => `${o.pixels.width}x${o.pixels.height}`));
    const icon = ICONS.find((s) => s.pixels.every((px) => pixels.has(px)));
    if (icon) {
      const top = Math.min(...group.map((o) => o.bbox.y));
      const bottom = Math.max(...group.map((o) => o.bbox.y + o.bbox.height));
      markers.push({
        kind: icon.kind,
        label: icon.label,
        page: g.page,
        x: img.bbox.x,
        y: top,
        height: bottom - top,
      });
    }
  });

  // An icon and its badge describe the same box: keep one marker per kind and position.
  return markers.filter(
    (m, i) =>
      !markers.some(
        (o, j) => j < i && o.kind === m.kind && o.page === m.page && Math.abs(o.y - m.y) < 30,
      ),
  );
}

/**
 * Side boxes: a pale panel narrower than the text column with a coloured label pill on its top
 * edge and an icon left of the pill, printed beside the main text. The label is drawn as
 * outlines, not text, so the icon tells which box it is.
 */
const SIDE_BOXES: IconSignature[] = [
  { kind: 'keywords', label: 'Açar sözlər', pixels: ['32x27', '2x27'] },
];

/** A box beside the text column; `frame` when its graphics are template decoration. */
export type SideBox = {
  kind: SourceBlockKind;
  label: string | null;
  number: string | null;
  page: number;
  bbox: BBox;
  /** What the box is drawn as (panel, label strip): it holds what lies inside one of them. */
  parts: BBox[];
  frame: boolean;
};

/** The side box holding something whose centre is at `b`, if any. */
export const sideBoxAt = (boxes: SideBox[], page: number, b: BBox) =>
  boxes.find((x) => x.page === page && x.parts.some((part) => centerInside(b, part)));

const PALE = 0.85; // panel fills are lighter than this, label pills darker

/**
 * Pale filled panels narrower than half the page: side boxes, notes, formula and drawing
 * backgrounds. Full-width boxes (Fikirləş!, Yadda saxla!) are wider.
 */
export function findPanels(g: PageGraphics, pageWidth: number): BBox[] {
  return g.paths
    .filter(
      ({ filled, fill, bbox: b }) =>
        filled &&
        fill !== '#ffffff' &&
        luminance(fill) >= PALE &&
        b.width >= 60 &&
        b.height >= 20 &&
        b.width <= pageWidth * 0.5,
    )
    .map((p) => p.bbox);
}

/**
 * Labelled side panels on a page. A box whose icon is unknown is still a box (as `callout`), so
 * its lines stay together and a person checks the label.
 */
export function findSideBoxes(g: PageGraphics, pageWidth: number): SideBox[] {
  const boxes: SideBox[] = [];
  for (const p of findPanels(g, pageWidth)) {
    if (sideBoxAt(boxes, g.page, p)) continue; // the same panel painted twice
    const pills = g.paths.filter(
      ({ filled, fill, bbox: b }) =>
        filled &&
        luminance(fill) < PALE &&
        b.height >= 10 &&
        b.height <= 24 &&
        b.width >= 40 &&
        b.y < p.y &&
        b.y + b.height > p.y &&
        b.x >= p.x + 8 && // label pills start 25-34pt in; table header rows sit flush left
        b.x + b.width <= p.x + p.width + 4,
    );
    const pill = pills[0];
    // Template badges (Fikirləş!, …) open full-width boxes through their markers instead; a pill
    // can be painted twice, in a badge colour and another.
    if (!pill || pills.some((q) => BADGES.some((s) => matchesBadge(s, q)))) continue;
    const icon = g.images.filter(
      ({ bbox: b }) =>
        b.x >= p.x - 40 && b.x + b.width <= pill.bbox.x + 2 && Math.abs(b.y - pill.bbox.y) < 20,
    );
    const pixels = new Set(icon.map((i) => `${i.pixels.width}x${i.pixels.height}`));
    const signature = SIDE_BOXES.find((s) => s.pixels.every((px) => pixels.has(px)));
    // So do boxes with a template icon (Yadda saxla!), however narrow.
    if (!signature && ICONS.some((s) => s.pixels.every((px) => pixels.has(px)))) continue;
    // The disc and ring painted behind the icon belong to the box too.
    const iconArea = union(icon.map((i) => i.bbox));
    const disc = iconArea
      ? g.paths.filter((q) => contains(grow(iconArea, 6), q.bbox)).map((q) => q.bbox)
      : [];
    // The label strip sticks out above (and the disc left of) the panel; text beside it is not
    // the box's, so the box is the panel plus the strip, not their bounding rectangle.
    const strip = union([pill.bbox, ...icon.map((i) => i.bbox), ...disc]) ?? pill.bbox;
    boxes.push({
      kind: signature?.kind ?? 'callout',
      label: signature?.label ?? null,
      number: null,
      page: g.page,
      bbox: union([p, strip]) ?? p,
      parts: [p, strip],
      frame: true,
    });
  }
  return boxes;
}

const grow = (b: BBox, d: number): BBox => ({
  x: b.x - d,
  y: b.y - d,
  width: b.width + 2 * d,
  height: b.height + 2 * d,
});
const contains = (outer: BBox, inner: BBox) =>
  inner.x >= outer.x &&
  inner.y >= outer.y &&
  inner.x + inner.width <= outer.x + outer.width &&
  inner.y + inner.height <= outer.y + outer.height;

/** Exercise numbers sit in small filled circles in the left gutter. */
/** Relative luminance (0–1) of a "#rrggbb" fill; unknown formats count as dark. */
function luminance(hex: string): number {
  const m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  if (!m) return 0;
  const [r, g, b] = [m[1], m[2], m[3]].map((c) => parseInt(c ?? '0', 16) / 255);
  return 0.2126 * (r ?? 0) + 0.7152 * (g ?? 0) + 0.0722 * (b ?? 0);
}

/**
 * Exercise number badges: filled, saturated circles (~18pt) in the left gutter. Pale, smaller
 * circles (~14.6pt, e.g. #fffad8) mark the order of operations inside an exercise, not a task.
 */
export function findNumberCircles(
  g: PageGraphics,
): { page: number; bbox: PageGraphics['paths'][number]['bbox'] }[] {
  return g.paths
    .filter((p) => {
      const { x, width, height } = p.bbox;
      return (
        p.filled &&
        luminance(p.fill) < 0.85 &&
        x < 120 &&
        width >= 16 &&
        width <= 24 &&
        height >= 16 &&
        height <= 24 &&
        Math.abs(width - height) <= 3
      );
    })
    .map((p) => ({ page: g.page, bbox: p.bbox }));
}
