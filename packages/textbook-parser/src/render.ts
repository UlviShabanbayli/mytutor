import { createHash } from 'node:crypto';
import { createCanvas, type Canvas } from '@napi-rs/canvas';
import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist/legacy/build/pdf.mjs';
import type { BBox } from '@mytutor/types';

export type RenderedPage = { page: number; canvas: Canvas; scale: number };

export const sha256 = (data: Buffer | Uint8Array) =>
  createHash('sha256').update(data).digest('hex');

/** Renders one PDF page to a canvas (pdf.js + @napi-rs/canvas; no browser needed). */
export async function renderPage(
  pdf: PDFDocumentProxy,
  page: number,
  scale: number,
): Promise<RenderedPage> {
  const p = await pdf.getPage(page);
  const viewport = p.getViewport({ scale });
  const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
  // pdf.js accepts any canvas with a 2D context; @napi-rs/canvas matches the DOM API it uses.
  type PdfCanvas = Parameters<PDFPageProxy['render']>[0]['canvas'];
  await p.render({ canvas: canvas as unknown as PdfCanvas, viewport }).promise;
  return { page, canvas, scale };
}

/** Cuts a region (points, top-left origin) out of a rendered page. */
export function crop(rendered: RenderedPage, bbox: BBox): Buffer {
  const s = rendered.scale;
  const x = Math.max(0, Math.floor(bbox.x * s));
  const y = Math.max(0, Math.floor(bbox.y * s));
  const w = Math.min(rendered.canvas.width - x, Math.ceil(bbox.width * s));
  const h = Math.min(rendered.canvas.height - y, Math.ceil(bbox.height * s));
  const out = createCanvas(Math.max(1, w), Math.max(1, h));
  out.getContext('2d').drawImage(rendered.canvas, x, y, w, h, 0, 0, w, h);
  return out.toBuffer('image/png');
}
