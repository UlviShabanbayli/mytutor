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
  /**
   * Text came from the glyph decoder (composite fonts): it is the real text and must not be
   * "repaired" again. Raw runs from simple fonts still go through the repair heuristics.
   */
  decoded: boolean;
};

/** Items on the same baseline joined left to right. */
export type TextLine = {
  page: number;
  text: string;
  /** Largest and smallest run sizes: superscripts and math fonts differ from body size. */
  size: number;
  minSize: number;
  x: number;
  /** Baseline, PDF coordinates (bottom-left origin). */
  y: number;
  width: number;
};

export type ExtractedPdf = {
  file: string;
  pageCount: number;
  pageHeight: number;
  items: TextItem[];
};
