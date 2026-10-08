import type { SourceBlock } from '@mytutor/types';

/** Deterministic sanity checks a reviewer should see. */
export function validateBlocks(blocks: SourceBlock[]): string[] {
  const warnings: string[] = [];
  const numbers = blocks.filter((b) => b.kind === 'exercise').map((b) => Number(b.number));
  numbers.forEach((n, i) => {
    const prev = numbers[i - 1];
    if (i > 0 && prev !== undefined && n !== prev + 1)
      warnings.push(`Tapşırıq nömrələri ardıcıl deyil: ${prev} → ${n}`);
  });
  for (const b of blocks) {
    if (b.kind === 'callout')
      warnings.push(`${b.id}: tanınmayan nişan (səh. ${b.regions[0]?.page})`);
    const container = b.kind === 'exercises' || b.kind === 'problems';
    if (!container && b.lineIds.length === 0 && b.figureIds.length === 0) {
      warnings.push(`${b.id} (${b.kind}): blokda mətn və ya fiqur tapılmadı`);
    }
  }
  return warnings;
}
