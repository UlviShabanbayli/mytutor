import type { SourceBlockKind } from '@mytutor/types';
import type { PageGraphics } from './graphics';

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
    const { x, y, width, height } = p.bbox;
    if (!p.filled || x > LEFT_ZONE || p.fill === '#ffffff') continue;
    const badge = BADGES.find(
      (b) =>
        b.fill === p.fill &&
        width >= b.width[0] &&
        width <= b.width[1] &&
        height >= b.height[0] &&
        height <= b.height[1],
    );
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
