import { basename } from 'node:path';
import { textbookStructureSchema } from '@mytutor/schemas';
import type { TextbookStructure } from '@mytutor/types';
import { bodySize, classifyHeadings } from './classify';
import { extractPdf } from './extract';
import type { ExtractedPdf } from './types';
import { groupLines } from './lines';
import { repairHeading } from './repair';
import { applyToc, buildStructure, validate } from './structure';
import { readPageNumbers, readToc } from './toc';

export { renderReport } from './report';

/** Splits a textbook PDF into units, topics, blocks and sections — no LLM involved. */
export async function splitTextbook(file: string): Promise<TextbookStructure> {
  return splitExtracted(await extractPdf(file));
}

/** The same, for text already extracted (callers that also need the items read the PDF once). */
export function splitExtracted(pdf: ExtractedPdf): TextbookStructure {
  const file = pdf.file;
  const body = bodySize(pdf.items);
  const toc = readToc(pdf.items);
  const numbers = readPageNumbers(pdf.items, pdf.pageHeight, body);
  const lines = groupLines(pdf.items, repairHeading);
  const labels = pdf.items.filter((i) => i.isLabel && i.size >= body * 1.6);

  const lastPage = numbers.lastNumberedPage ?? pdf.pageCount;
  const events = classifyHeadings(lines, labels, body, {
    from: (toc.page ?? 0) + 1,
    to: lastPage,
    height: pdf.pageHeight,
  });
  const built = buildStructure({ events, pageHeight: pdf.pageHeight, lastPage });
  const numbering = applyToc(built.units, built.backMatter, toc.entries, numbers.offset);
  // Headings the contents re-titled no longer need an "unreadable heading" warning.
  const headingWarnings = built.warnings.filter(
    (w) => !numbering.replaced.some((heading) => w.startsWith(heading)),
  );
  const checked = validate(built.units, toc.counts);

  return textbookStructureSchema.parse({
    source: { file: basename(file), pageCount: pdf.pageCount, printedPageOffset: numbers.offset },
    units: built.units,
    backMatter: built.backMatter,
    validation: {
      tocTopicCounts: toc.counts,
      detectedTopicCounts: checked.detectedTopicCounts,
      warnings: [...checked.warnings, ...numbering.warnings, ...headingWarnings],
    },
  });
}
