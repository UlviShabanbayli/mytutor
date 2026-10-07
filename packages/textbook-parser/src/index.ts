import { basename } from 'node:path';
import { textbookStructureSchema } from '@mytutor/schemas';
import type { TextbookStructure } from '@mytutor/types';
import { bodySize, classifyHeadings } from './classify';
import { extractPdf } from './extract';
import { groupLines } from './lines';
import { repairHeading } from './repair';
import { buildStructure, validate } from './structure';
import { readPageNumbers, readToc } from './toc';

export { renderReport } from './report';

/** Splits a textbook PDF into units, topics, blocks and sections — no LLM involved. */
export async function splitTextbook(file: string): Promise<TextbookStructure> {
  const pdf = await extractPdf(file);
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
  const checked = validate(built.units, toc.counts);

  return textbookStructureSchema.parse({
    source: { file: basename(file), pageCount: pdf.pageCount, printedPageOffset: numbers.offset },
    units: built.units,
    backMatter: built.backMatter,
    validation: {
      tocTopicCounts: toc.counts,
      detectedTopicCounts: checked.detectedTopicCounts,
      warnings: [...checked.warnings, ...built.warnings],
    },
  });
}
