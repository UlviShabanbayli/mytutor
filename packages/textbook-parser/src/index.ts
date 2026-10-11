import { basename } from 'node:path';
import { textbookStructureSchema } from '@mytutor/schemas';
import type { TextbookStructure, TextbookUnit } from '@mytutor/types';
import { bodySize, classifyHeadings } from './classify';
import { readContents } from './contents';
import { extractPdf } from './extract';
import { inferOffset, structureFromContents } from './fromContents';
import type { ExtractedPdf, TextLine } from './types';
import { groupLines } from './lines';
import { repairHeading } from './repair';
import { applyToc, buildStructure, validate } from './structure';
import { readPageNumbers, readToc } from './toc';

export { renderReport } from './report';

/** Splits a textbook PDF into units, topics, blocks and sections — no LLM involved. */
export async function splitTextbook(file: string): Promise<TextbookStructure> {
  return splitExtracted(await extractPdf(file));
}

const topicCount = (units: TextbookUnit[]) =>
  units.reduce((n, u) => n + u.items.filter((i) => i.type === 'topic').length, 0);

type Split = Pick<TextbookStructure, 'units' | 'backMatter' | 'validation'> & {
  printedPageOffset: number | null;
};

/**
 * The same, for text already extracted (callers that also need the items read the PDF once).
 * Books in the TRİMS layout (numbered topics in the contents, topic badges) split by their
 * headings. Any other book splits by its table of contents, read without assuming a layout.
 */
export function splitExtracted(pdf: ExtractedPdf): TextbookStructure {
  const body = bodySize(pdf.items);
  const height = (page: number) => pdf.pageHeights?.[page] ?? pdf.pageHeight;
  const numbers = readPageNumbers(pdf.items, height, body);
  const lines = groupLines(pdf.items, repairHeading);
  const lastPage = numbers.lastNumberedPage ?? pdf.pageCount;
  const byHeadings = splitByHeadings(pdf, lines, body, numbers.offset, lastPage, height);

  let split = byHeadings;
  if (Object.keys(byHeadings.validation.tocTopicCounts).length === 0) {
    const byContents = splitByContents(pdf, lines, body, numbers.offset, lastPage, height);
    const listed = byContents ? topicCount(byContents.units) : 0;
    if (byContents && listed >= 3 && topicCount(byHeadings.units) < listed / 2) split = byContents;
  }

  const { printedPageOffset, ...structure } = split;
  return textbookStructureSchema.parse({
    source: { file: basename(pdf.file), pageCount: pdf.pageCount, printedPageOffset },
    ...structure,
  });
}

/** Headings classified by size and badge (calibrated on TRİMS), numbered by the contents. */
function splitByHeadings(
  pdf: ExtractedPdf,
  lines: TextLine[],
  body: number,
  offset: number | null,
  lastPage: number,
  height: (page: number) => number,
): Split {
  const toc = readToc(pdf.items);
  const labels = pdf.items.filter((i) => i.isLabel && i.size >= body * 1.6);
  const events = classifyHeadings(lines, labels, body, {
    from: (toc.page ?? 0) + 1,
    to: lastPage,
    height,
  });
  const built = buildStructure({ events, pageHeight: height, lastPage });
  const numbering = applyToc(built.units, built.backMatter, toc.entries, offset);
  // Headings the contents re-titled no longer need an "unreadable heading" warning.
  const headingWarnings = built.warnings.filter(
    (w) => !numbering.replaced.some((heading) => w.startsWith(heading)),
  );
  const checked = validate(built.units, toc.counts);
  return {
    printedPageOffset: offset,
    units: built.units,
    backMatter: built.backMatter,
    validation: {
      method: 'headings',
      tocTopicCounts: toc.counts,
      detectedTopicCounts: checked.detectedTopicCounts,
      warnings: [...checked.warnings, ...numbering.warnings, ...headingWarnings],
    },
  };
}

/** Units, topics and blocks as the contents list them, found in the text by their titles. */
function splitByContents(
  pdf: ExtractedPdf,
  lines: TextLine[],
  body: number,
  printedOffset: number | null,
  lastPage: number,
  height: (page: number) => number,
): Split | null {
  const contents = readContents(pdf.items, pdf.pageCount);
  if (!contents.units.length) return null;
  const offset = printedOffset ?? inferOffset(contents, lines, body);
  if (offset === null) return null;
  const built = structureFromContents({
    contents,
    lines,
    body,
    offset,
    pageHeight: height,
    lastPage,
  });
  const checked = validate(built.units, built.counts);
  return {
    printedPageOffset: offset,
    units: built.units,
    backMatter: built.backMatter,
    validation: {
      method: 'contents',
      tocTopicCounts: built.counts,
      detectedTopicCounts: checked.detectedTopicCounts,
      warnings: [...checked.warnings, ...built.warnings],
    },
  };
}
