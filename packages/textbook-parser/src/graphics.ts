import { OPS, Util, type PDFPageProxy } from 'pdfjs-dist/legacy/build/pdf.mjs';
import type { BBox } from '@mytutor/types';

/** A painted raster image; `pixels` is its intrinsic size (used to fingerprint template icons). */
export type PageImage = { bbox: BBox; pixels: { width: number; height: number } };
/** A filled or stroked vector path with its fill colour at paint time. */
export type PagePath = { bbox: BBox; fill: string; filled: boolean };
export type PageGraphics = { page: number; images: PageImage[]; paths: PagePath[] };

type Matrix = number[];

/** PDF (bottom-left origin) rectangle from two corners → top-left-origin bbox. */
function toTopLeft(
  ctm: Matrix,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  pageHeight: number,
): BBox {
  const apply = (x: number, y: number) => [
    (ctm[0] ?? 1) * x + (ctm[2] ?? 0) * y + (ctm[4] ?? 0),
    (ctm[1] ?? 0) * x + (ctm[3] ?? 1) * y + (ctm[5] ?? 0),
  ];
  const corners = [apply(x0, y0), apply(x1, y0), apply(x0, y1), apply(x1, y1)];
  const xs = corners.map((c) => c[0] ?? 0);
  const ys = corners.map((c) => c[1] ?? 0);
  const left = Math.min(...xs);
  const bottom = Math.min(...ys);
  return {
    x: left,
    y: pageHeight - Math.max(...ys),
    width: Math.max(...xs) - left,
    height: Math.max(...ys) - bottom,
  };
}

/**
 * Walks the page's operator list tracking the transformation matrix, and records where
 * raster images and vector paths are painted. Text is handled separately (extract.ts).
 */
export async function readGraphics(page: PDFPageProxy, pageHeight: number): Promise<PageGraphics> {
  const ops = await page.getOperatorList();
  const images: PageImage[] = [];
  const paths: PagePath[] = [];
  const stack: Matrix[] = [];
  let ctm: Matrix = [1, 0, 0, 1, 0, 0];
  let fill = '#000000';

  for (let i = 0; i < ops.fnArray.length; i++) {
    const fn = ops.fnArray[i];
    const args = ops.argsArray[i] as unknown[];
    switch (fn) {
      case OPS.save:
        stack.push(ctm);
        break;
      case OPS.restore:
        ctm = stack.pop() ?? ctm;
        break;
      case OPS.transform:
        ctm = Util.transform(ctm, args as number[]);
        break;
      case OPS.paintFormXObjectBegin:
        stack.push(ctm);
        if (Array.isArray(args[0])) ctm = Util.transform(ctm, args[0] as number[]);
        break;
      case OPS.paintFormXObjectEnd:
        ctm = stack.pop() ?? ctm;
        break;
      case OPS.setFillRGBColor:
        fill = String(args[0] ?? args);
        break;
      case OPS.paintImageXObject:
      case OPS.paintInlineImageXObject:
      case OPS.paintImageMaskXObject:
        images.push({
          bbox: toTopLeft(ctm, 0, 0, 1, 1, pageHeight),
          pixels: { width: Number(args[1] ?? 0), height: Number(args[2] ?? 0) },
        });
        break;
      case OPS.constructPath: {
        // args: [paint op, path data, [minX, minY, maxX, maxY]] in user space.
        const minMax = args[2] as ArrayLike<number> | undefined;
        if (!minMax || minMax.length !== 4) break;
        const [x0 = 0, y0 = 0, x1 = 0, y1 = 0] = Array.from(minMax);
        const op = Number(args[0]);
        if (op === OPS.endPath) break; // clipping path, nothing is painted
        const filled = [
          OPS.fill,
          OPS.eoFill,
          OPS.fillStroke,
          OPS.eoFillStroke,
          OPS.closeFillStroke,
          OPS.closeEOFillStroke,
        ].includes(op);
        paths.push({ bbox: toTopLeft(ctm, x0, y0, x1, y1, pageHeight), fill, filled });
        break;
      }
    }
  }
  return { page: page.pageNumber, images, paths };
}
