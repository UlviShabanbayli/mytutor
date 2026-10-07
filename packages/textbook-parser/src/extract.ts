import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import type { ExtractedPdf, TextItem } from './types';

/** Numeric badge glyphs: raw control codes and digits/dots only, e.g. "\u001f\u001e\u001d\u001e". */
// eslint-disable-next-line no-control-regex -- broken fonts emit raw control codes as glyphs
const LABEL = /^[\u0003-\u001f\d.\s]{1,8}$/;

// eslint-disable-next-line no-control-regex -- see LABEL
const RAW_CODE = /[\u0003-\u001f]/;

/** Reads every positioned text run from the PDF. Text is raw; repair happens per use. */
export async function extractPdf(file: string): Promise<ExtractedPdf> {
  const task = getDocument({ url: file, verbosity: 0 });
  const pdf = await task.promise;
  const items: TextItem[] = [];
  let pageHeight = 0;

  for (let n = 1; n <= pdf.numPages; n++) {
    const page = await pdf.getPage(n);
    pageHeight = Math.max(pageHeight, page.view[3] ?? 0);
    const content = await page.getTextContent();
    for (const item of content.items) {
      if (!('str' in item) || item.str.trim() === '') continue;
      const [, , c = 0, d = 0, x = 0, y = 0] = item.transform as number[];
      const size = Math.hypot(c, d);
      items.push({
        page: n,
        text: item.str,
        size,
        x,
        y,
        width: item.width,
        // Badges are drawn in their own font with control-code glyphs.
        isLabel: LABEL.test(item.str) && RAW_CODE.test(item.str),
      });
    }
    page.cleanup();
  }

  const pageCount = pdf.numPages;
  await task.destroy();
  return { file, pageCount, pageHeight, items };
}
