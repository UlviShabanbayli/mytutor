import { extractedItemSchema } from '@mytutor/schemas';
import type { KnowledgeItem, KnowledgeItemType } from '@mytutor/types';

/** How one content field is edited. */
export type FieldSpec =
  | { key: string; kind: 'line' | 'text' | 'latex'; nullable?: boolean }
  /** `{ text, latex }`, either part may be empty. */
  | { key: string; kind: 'math' }
  /** A list of `{ text, latex }`: worked-example steps. */
  | { key: string; kind: 'mathList' }
  /** A list of `{ label, text, latex }`: an exercise's a), b), c). */
  | { key: string; kind: 'subItems' }
  /** A list of short strings: a figure's labels. */
  | { key: string; kind: 'labels' };

/** The editable fields of each item type, in the order the card shows them. */
export const FIELDS: Record<KnowledgeItemType, FieldSpec[]> = {
  definition: [
    { key: 'concept', kind: 'line' },
    { key: 'statement', kind: 'text' },
  ],
  rule: [
    { key: 'statement', kind: 'text' },
    { key: 'latex', kind: 'latex', nullable: true },
  ],
  formula: [
    { key: 'name', kind: 'line', nullable: true },
    { key: 'latex', kind: 'latex' },
    { key: 'spoken', kind: 'text' },
  ],
  worked_example: [
    { key: 'label', kind: 'line' },
    { key: 'problem', kind: 'math' },
    { key: 'steps', kind: 'mathList' },
    { key: 'explanation', kind: 'text', nullable: true },
  ],
  exercise: [
    { key: 'number', kind: 'line' },
    { key: 'instruction', kind: 'text' },
    { key: 'items', kind: 'subItems' },
  ],
  question: [
    { key: 'text', kind: 'text' },
    { key: 'latex', kind: 'latex', nullable: true },
  ],
  figure: [
    { key: 'description', kind: 'text' },
    { key: 'labels', kind: 'labels' },
  ],
  term: [
    { key: 'term', kind: 'line' },
    { key: 'context', kind: 'text' },
  ],
  prerequisite: [{ key: 'statement', kind: 'text' }],
};

/** What the form edits: every text is a string ('' for none), lists are arrays. */
export type Draft = Record<string, unknown>;
export type MathPart = { text: string; latex: string };
export type SubItem = { label: string; text: string; latex: string };

const str = (value: unknown) => (typeof value === 'string' ? value : '');
const list = (value: unknown): Record<string, unknown>[] =>
  Array.isArray(value)
    ? value.filter((v): v is Record<string, unknown> => !!v && typeof v === 'object')
    : [];
const orNull = (value: string) => (value.trim() ? value.trim() : null);

export function toDraft(type: KnowledgeItemType, content: KnowledgeItem['content']): Draft {
  const draft: Draft = {};
  for (const field of FIELDS[type]) {
    const value = content[field.key];
    if (field.kind === 'math') {
      const math = (value ?? {}) as Record<string, unknown>;
      draft[field.key] = { text: str(math.text), latex: str(math.latex) } satisfies MathPart;
    } else if (field.kind === 'mathList') {
      draft[field.key] = list(value).map((m) => ({ text: str(m.text), latex: str(m.latex) }));
    } else if (field.kind === 'subItems') {
      draft[field.key] = list(value).map((m) => ({
        label: str(m.label),
        text: str(m.text),
        latex: str(m.latex),
      }));
    } else if (field.kind === 'labels') {
      draft[field.key] = Array.isArray(value) ? value.map(str) : [];
    } else draft[field.key] = str(value);
  }
  return draft;
}

/** Back to the stored content shape: empty optional texts become null, empty labels go. */
export function fromDraft(type: KnowledgeItemType, draft: Draft): KnowledgeItem['content'] {
  const content: KnowledgeItem['content'] = {};
  for (const field of FIELDS[type]) {
    const value = draft[field.key];
    if (field.kind === 'math') {
      const math = value as MathPart;
      content[field.key] = { text: orNull(math.text), latex: orNull(math.latex) };
    } else if (field.kind === 'mathList') {
      content[field.key] = (value as MathPart[]).map((m) => ({
        text: orNull(m.text),
        latex: orNull(m.latex),
      }));
    } else if (field.kind === 'subItems') {
      content[field.key] = (value as SubItem[]).map((m) => ({
        label: m.label.trim(),
        text: orNull(m.text),
        latex: orNull(m.latex),
      }));
    } else if (field.kind === 'labels') {
      content[field.key] = (value as string[]).map((l) => l.trim()).filter(Boolean);
    } else {
      const text = str(value);
      content[field.key] = field.nullable ? orNull(text) : text.trim();
    }
  }
  return content;
}

/** Null when the content fits the item's type; otherwise the path of the first problem. */
export function correctionProblem(
  item: KnowledgeItem,
  content: KnowledgeItem['content'],
): string | null {
  const parsed = extractedItemSchema.safeParse({
    ...content,
    type: item.type,
    ref: item.id,
    origin: item.claimedOrigin,
    readFrom: item.readFrom,
    sources: item.sources.map(({ blockId, lineIds, figureId }) => ({ blockId, lineIds, figureId })),
  });
  if (parsed.success) {
    const empty = FIELDS[item.type].find(
      (f) =>
        (f.kind === 'line' || f.kind === 'text' || f.kind === 'latex') &&
        !f.nullable &&
        !str(content[f.key]),
    );
    return empty ? empty.key : null;
  }
  return parsed.error.issues[0]?.path.join('.') ?? '';
}
