import { createCanvas } from '@napi-rs/canvas';
import { describe, expect, it } from 'vitest';
import { cropBands, grayOf, markBands, pageLayout } from './testPages';

/** A two-column page: a rule down the middle, two lines on the left, one on the right. */
function page() {
  const canvas = createCanvas(600, 800);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#F2F0EC';
  ctx.fillRect(0, 0, 600, 800);
  ctx.fillStyle = '#222';
  ctx.fillRect(299, 60, 2, 700); // the column rule
  ctx.fillRect(40, 20, 520, 14); // a running header across the page
  ctx.fillRect(40, 100, 220, 14);
  ctx.fillRect(40, 200, 200, 14);
  ctx.fillRect(330, 120, 230, 14);
  // The back page showing through: light, not ink.
  ctx.fillStyle = '#C8C6C2';
  ctx.fillRect(40, 150, 220, 10);
  return canvas;
}

describe('test page layout', () => {
  it('finds the column rule and names each line of ink by its column', () => {
    const layout = pageLayout(grayOf(page()), 7);
    expect(layout.rule).toMatchObject({ x: expect.closeTo(300, 3) as number, y0: 60 });
    expect(layout.bands.map((b) => b.id)).toEqual(['T1', 'L1', 'L2', 'R1']);
    expect(layout.bands.find((b) => b.id === 'L2')).toMatchObject({ y0: 200, y1: 214 });
  });

  it('marks band ids in the margins and cuts bands out', () => {
    const canvas = page();
    const layout = pageLayout(grayOf(canvas), 7);
    expect(markBands(canvas, layout.bands).width).toBe(600);
    const cut = cropBands(
      canvas,
      layout.bands.filter((b) => b.id === 'L1' || b.id === 'L2'),
    );
    expect(cut?.height).toBe(214 - 100 + 12);
  });
});
