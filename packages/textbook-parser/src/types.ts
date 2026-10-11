/** One positioned text run from the PDF (pdf.js text item), after glyph repair. */
export type TextItem = {
  page: number;
  text: string;
  /** Font size in points. */
  size: number;
  x: number;
  /** Baseline from the bottom of the page (PDF coordinates). */
  y: number;
  width: number;
  /** Short numeric marker drawn next to a heading (e.g. the "1.2." topic badge). */
  isLabel: boolean;
};

/** Items on the same baseline joined left to right. */
export type TextLine = {
  page: number;
  text: string;
  size: number;
  x: number;
  y: number;
};

export type ExtractedPdf = {
  file: string;
  pageCount: number;
  pageHeight: number;
  items: TextItem[];
};
