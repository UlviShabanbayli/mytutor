import { createCanvas, type Canvas } from '@napi-rs/canvas';
import type { TestPageBand, TestPageLayout } from '@mytutor/types';

/**
 * The layout of a scanned test-book page, found from its pixels: the column rule (DİM books
 * print two columns with a line between them), and the lines of ink in each column as bands
 * with ids ("L12": left column, 12th band). Claude names bands by id; code turns ids into
 * regions, so the AI never writes coordinates.
 */

/** Ink is darker than this (0–255); the back page showing through is lighter. */
const DARK = 140;
/** A column rule runs at least this share of the page height. */
const RULE_SHARE = 0.4;
/** Rows of ink closer than this (px) belong to one band. */
const BAND_GAP = 4;
/** A band needs this many dark pixels, else it is dust. */
const MIN_INK = 24;

export type Gray = { width: number; height: number; data: Uint8Array };

/** Luminance of a canvas, one byte per pixel. */
export function grayOf(canvas: Canvas): Gray {
  const { width, height } = canvas;
  const rgba = canvas.getContext('2d').getImageData(0, 0, width, height).data;
  const data = new Uint8Array(width * height);
  for (let i = 0; i < data.length; i++)
    data[i] =
      ((rgba[i * 4] ?? 255) * 299 +
        (rgba[i * 4 + 1] ?? 255) * 587 +
        (rgba[i * 4 + 2] ?? 255) * 114) /
      1000;
  return { width, height, data };
}

const dark = (g: Gray, x: number, y: number) => (g.data[y * g.width + x] ?? 255) < DARK;

/** Rows a column rule may skip (a faint or broken print) and still be one line. */
const RULE_GAP = 6;

/**
 * The column rule: the longest unbroken near-vertical line in the middle of the page, with its
 * extent. A heading or a header line that crosses it does not stretch it.
 */
export function findRule(g: Gray): { x: number; top: number; bottom: number } | null {
  const runs: { x: number; top: number; bottom: number }[] = [];
  // A scan is seldom straight: a few pixels either side count as the line.
  for (let x = Math.floor(g.width * 0.38); x < g.width * 0.62; x++) {
    let best = { top: 0, bottom: -1 };
    let top = -1;
    let last = -RULE_GAP - 1;
    for (let y = 0; y < g.height; y++) {
      let hit = false;
      for (let dx = -2; dx <= 2 && !hit; dx++) hit = dark(g, x + dx, y);
      if (!hit) continue;
      if (y - last > RULE_GAP) top = y;
      last = y;
      if (last - top > best.bottom - best.top) best = { top, bottom: last };
    }
    runs.push({ x, ...best });
  }
  const longest = Math.max(...runs.map((r) => r.bottom - r.top));
  if (longest < g.height * RULE_SHARE) return null;
  // Several columns of the window see the same line: take the middle one.
  const tied = runs.filter((r) => r.bottom - r.top === longest);
  return tied[Math.floor(tied.length / 2)] ?? null;
}

/** Bands of ink in a box of the page, top to bottom, named `prefix` and a number. */
function bandsIn(
  g: Gray,
  box: { x0: number; x1: number; y0: number; y1: number },
  prefix: string,
  skip?: { x0: number; x1: number },
): TestPageBand[] {
  const rows: { ink: number; left: number; right: number }[] = [];
  for (let y = box.y0; y < box.y1; y++) {
    let ink = 0;
    let left = box.x1;
    let right = box.x0;
    for (let x = box.x0; x < box.x1; x++) {
      if (skip && x >= skip.x0 && x <= skip.x1) continue;
      if (!dark(g, x, y)) continue;
      ink++;
      left = Math.min(left, x);
      right = Math.max(right, x);
    }
    rows.push({ ink, left, right });
  }
  const bands: TestPageBand[] = [];
  let start = -1;
  let gap = 0;
  let acc = { ink: 0, left: box.x1, right: box.x0, last: -1 };
  const close = () => {
    if (start >= 0 && acc.ink >= MIN_INK)
      bands.push({
        id: `${prefix}${bands.length + 1}`,
        x0: acc.left,
        y0: box.y0 + start,
        x1: acc.right + 1,
        y1: box.y0 + acc.last + 1,
      });
    start = -1;
    acc = { ink: 0, left: box.x1, right: box.x0, last: -1 };
  };
  rows.forEach((row, i) => {
    if (row.ink >= 3) {
      if (start < 0) start = i;
      gap = 0;
      acc = {
        ink: acc.ink + row.ink,
        left: Math.min(acc.left, row.left),
        right: Math.max(acc.right, row.right),
        last: i,
      };
    } else if (start >= 0 && ++gap > BAND_GAP) close();
  });
  close();
  return bands;
}

/**
 * The page's bands: above and below the column rule across the whole width ("T", "B"), and in
 * the left and right columns ("L", "R"); a page without a rule is one column ("C").
 */
export function pageLayout(g: Gray, page: number): Omit<TestPageLayout, 'image' | 'marked'> {
  const rule = findRule(g);
  const whole = { x0: 0, x1: g.width };
  if (!rule)
    return {
      page,
      width: g.width,
      height: g.height,
      rule: null,
      bands: bandsIn(g, { ...whole, y0: 0, y1: g.height }, 'C'),
    };
  const line = { x0: rule.x - 4, x1: rule.x + 4 };
  return {
    page,
    width: g.width,
    height: g.height,
    rule: { x: rule.x, y0: rule.top, y1: rule.bottom },
    bands: [
      ...bandsIn(g, { ...whole, y0: 0, y1: rule.top }, 'T'),
      ...bandsIn(g, { x0: 0, x1: line.x0, y0: rule.top, y1: rule.bottom + 1 }, 'L'),
      ...bandsIn(g, { x0: line.x1, x1: g.width, y0: rule.top, y1: rule.bottom + 1 }, 'R'),
      ...bandsIn(g, { ...whole, y0: rule.bottom + 1, y1: g.height }, 'B'),
    ],
  };
}

/** The page with every band's id in the margin beside it, for Claude to name bands by. */
export function markBands(page: Canvas, bands: TestPageBand[]): Canvas {
  const out = createCanvas(page.width, page.height);
  const ctx = out.getContext('2d');
  ctx.drawImage(page, 0, 0);
  ctx.font = 'bold 11px sans-serif';
  ctx.textBaseline = 'middle';
  for (const band of bands) {
    const label = band.id;
    const width = ctx.measureText(label).width + 4;
    // Right-column labels go in the right margin, all others in the left one.
    const x = band.id.startsWith('R') ? page.width - width - 2 : 2;
    const y = Math.max(7, Math.min(page.height - 7, (band.y0 + band.y1) / 2));
    ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
    ctx.fillRect(x, y - 7, width, 14);
    ctx.fillStyle = '#C8102E';
    ctx.fillText(label, x + 2, y);
  }
  return out;
}

/** Cuts the rectangle around `bands` (with a margin) out of the page. */
export function cropBands(page: Canvas, bands: TestPageBand[], pad = 6): Canvas | null {
  if (!bands.length) return null;
  const x0 = Math.max(0, Math.min(...bands.map((b) => b.x0)) - pad);
  const y0 = Math.max(0, Math.min(...bands.map((b) => b.y0)) - pad);
  const x1 = Math.min(page.width, Math.max(...bands.map((b) => b.x1)) + pad);
  const y1 = Math.min(page.height, Math.max(...bands.map((b) => b.y1)) + pad);
  const out = createCanvas(x1 - x0, y1 - y0);
  out.getContext('2d').drawImage(page, x0, y0, x1 - x0, y1 - y0, 0, 0, x1 - x0, y1 - y0);
  return out;
}
