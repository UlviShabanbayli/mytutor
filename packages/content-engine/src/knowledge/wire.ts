import { extractedItemSchema } from '@mytutor/schemas';
import type { ExtractedItem, WireItem } from '@mytutor/types';

export type Rejected = { ref: string; type: WireItem['type']; reason: string };

/** "" on the wire means "not printed / not applicable". */
const opt = (s: string) => (s.trim() === '' ? null : s);
const math = (m: { text: string; latex: string }) => ({ text: opt(m.text), latex: opt(m.latex) });

/** Type-specific fields of a flat model item, with "" turned back into null. */
function fieldsOf(w: WireItem): Record<string, unknown> {
  switch (w.type) {
    case 'definition':
      return { concept: opt(w.concept), statement: opt(w.statement) };
    case 'rule':
      return { statement: opt(w.statement), latex: opt(w.latex) };
    case 'formula':
      return { name: opt(w.name), latex: opt(w.latex), spoken: opt(w.spoken) };
    case 'worked_example':
      return {
        label: opt(w.label),
        problem: math(w.problem),
        steps: w.steps.map(math),
        explanation: opt(w.explanation),
      };
    case 'exercise':
      return {
        number: opt(w.number),
        instruction: opt(w.instruction),
        items: w.items.map((i) => ({ label: i.label, ...math(i) })),
      };
    case 'question':
      return { text: opt(w.text), latex: opt(w.latex) };
    case 'figure':
      return { description: opt(w.description), labels: w.labels };
    case 'term':
      return { term: opt(w.term), context: opt(w.context) };
    case 'prerequisite':
      return { statement: opt(w.statement) };
  }
}

/**
 * Converts the model's flat items to typed items. An item whose required fields are empty for
 * its type is rejected (reported, never silently repaired).
 */
export function fromWire(items: WireItem[]): { items: ExtractedItem[]; rejected: Rejected[] } {
  const out: ExtractedItem[] = [];
  const rejected: Rejected[] = [];
  for (const w of items) {
    const parsed = extractedItemSchema.safeParse({
      type: w.type,
      ref: w.ref,
      origin: w.origin,
      sources: w.sources.map((src) => ({ ...src, figureId: opt(src.figureId) })),
      readFrom: w.readFrom,
      ...fieldsOf(w),
    });
    if (parsed.success) out.push(parsed.data);
    else {
      const reason = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
      rejected.push({ ref: w.ref, type: w.type, reason });
    }
  }
  return { items: out, rejected };
}
