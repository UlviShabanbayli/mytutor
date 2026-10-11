import type {
  ExtractedItem,
  KnowledgeCheck,
  KnowledgeStatus,
  SourceBlock,
  TopicSource,
  VerificationVerdict,
} from '@mytutor/types';
import { checkIdentity, latexSyntaxError, solutionsOf } from './latex';

const QUESTION_BLOCKS = new Set(['inquiry', 'think', 'find_mistake', 'history']);
const GROUNDING_PASS = 0.8;

const normalizeLabel = (s: string | null) =>
  (s ?? '').replace(/\.$/, '').replace(/\s+/g, ' ').trim().toLocaleUpperCase('az');
const words = (s: string) =>
  s
    .toLocaleLowerCase('az')
    .replace(/[^\p{L}\d\s]/gu, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 3);

function descendants(source: TopicSource, id: string): SourceBlock[] {
  const out = source.blocks.filter((b) => b.id === id);
  for (const b of source.blocks)
    if (b.parentId && out.some((o) => o.id === b.parentId)) out.push(b);
  return out;
}

/** All LaTeX an item carries, for syntax checks. */
export function latexOf(item: ExtractedItem): string[] {
  switch (item.type) {
    case 'formula':
      return [item.latex];
    case 'rule':
    case 'question':
      return item.latex ? [item.latex] : [];
    case 'worked_example':
      return [item.problem.latex, ...item.steps.map((s) => s.latex)].filter(
        (l): l is string => !!l,
      );
    case 'exercise':
      return item.items.map((i) => i.latex).filter((l): l is string => !!l);
    default:
      return [];
  }
}

/** A step that ends with an operator continues on the next line (the book wraps long rows). */
const CONTINUES = /(?:[+\-=]|\\cdot|\\times)\s*$/;

/** Equalities to test numerically. Steps starting with "=" continue the previous expression. */
export function identitiesOf(item: ExtractedItem): string[] {
  if (item.type === 'formula') return [item.latex];
  if (item.type === 'rule' && item.latex) return [item.latex];
  if (item.type !== 'worked_example') return [];
  const out: string[] = [];
  let last = item.problem.latex ?? '';
  let pending = '';
  for (const step of item.steps) {
    let l = step.latex?.trim();
    if (!l) continue;
    if (pending) {
      // "… =" + "= …" and "… +" + "+ …" repeat the operator at the wrap.
      const op = pending.at(-1);
      l = `${pending} ${(op && l.startsWith(op) ? l.slice(1) : l).trimStart()}`;
      pending = '';
    }
    if (CONTINUES.test(l)) {
      pending = l;
      continue;
    }
    const chain = l.startsWith('=') ? `${last}${l}` : l;
    if (chain.includes('=')) out.push(chain);
    last = chain.split('=').at(-1) ?? last;
  }
  return out;
}

/** Azerbaijani prose the item claims is printed, for text grounding. */
function proseOf(item: ExtractedItem): string | null {
  switch (item.type) {
    case 'definition':
    case 'rule':
    case 'prerequisite':
      return item.statement;
    case 'question':
      return item.text;
    case 'term':
      return item.term;
    case 'exercise':
      return item.instruction;
    case 'worked_example':
      return item.explanation;
    default:
      return null;
  }
}

/** Deterministic checks plus the image verdict. */
export function checkItem(
  item: ExtractedItem,
  source: TopicSource,
  verdict?: VerificationVerdict,
): KnowledgeCheck[] {
  const checks: KnowledgeCheck[] = [];
  const blockIds = new Set(source.blocks.map((b) => b.id));
  const figureIds = new Set(source.figures.map((f) => f.id));

  // 1. Every cited ID exists, and lines belong to the cited block (or blocks inside it).
  const idProblems = item.sources.flatMap((s) => {
    if (!blockIds.has(s.blockId)) return [`blok ${s.blockId} yoxdur`];
    const lines = new Set(descendants(source, s.blockId).flatMap((b) => b.lineIds));
    return [
      ...s.lineIds.filter((l) => !lines.has(l)).map((l) => `${l} ${s.blockId} blokuna aid deyil`),
      ...(s.figureId && !figureIds.has(s.figureId) ? [`fiqur ${s.figureId} yoxdur`] : []),
    ];
  });
  checks.push({
    name: 'source_ids',
    result: idProblems.length ? 'fail' : 'pass',
    detail: idProblems.join('; ') || null,
  });

  // 2. Book blocks keep their identity: a NÜMUNƏ stays that NÜMUNƏ, exercise N stays N.
  const cited = item.sources
    .map((s) => source.blocks.find((b) => b.id === s.blockId))
    .filter((b) => b !== undefined);
  if (item.type === 'worked_example') {
    const ok = cited.some(
      (b) => b.kind === 'example' && normalizeLabel(b.label) === normalizeLabel(item.label),
    );
    checks.push({
      name: 'block_kind',
      result: ok ? 'pass' : 'fail',
      detail: ok ? null : `"${item.label}" NÜMUNƏ blokuna uyğun gəlmir`,
    });
  } else if (item.type === 'exercise') {
    const ok = cited.some((b) => b.kind === 'exercise' && b.number === item.number);
    checks.push({
      name: 'block_kind',
      result: ok ? 'pass' : 'fail',
      detail: ok ? null : `tapşırıq ${item.number} mənbə blokunun nömrəsi deyil`,
    });
  } else if (item.type === 'question') {
    const ok = cited.some((b) => QUESTION_BLOCKS.has(b.kind));
    checks.push({
      name: 'block_kind',
      result: ok ? 'pass' : 'fail',
      detail: ok ? null : 'sual Araşdırma/Fikirləş blokundan deyil',
    });
  } else checks.push({ name: 'block_kind', result: 'skip', detail: null });

  // 3. Prose read from the text layer must be found there.
  const prose = proseOf(item);
  if (prose && item.readFrom === 'text') {
    const sourceText = item.sources
      .flatMap((s) => {
        const ids = s.lineIds.length
          ? s.lineIds
          : descendants(source, s.blockId).flatMap((b) => b.lineIds);
        return ids.map((id) => source.lines.find((l) => l.id === id)?.text ?? '');
      })
      .join(' ');
    const have = new Set(words(sourceText));
    const claim = words(prose);
    const recall = claim.length ? claim.filter((w) => have.has(w)).length / claim.length : 1;
    checks.push({
      name: 'text_grounding',
      result: recall >= GROUNDING_PASS ? 'pass' : 'fail',
      detail: `sözlərin ${Math.round(recall * 100)}%-i mənbə sətirlərində var`,
    });
  } else
    checks.push({
      name: 'text_grounding',
      result: 'skip',
      detail: prose ? 'şəkildən oxunub' : null,
    });

  // 4. LaTeX parses.
  const latex = latexOf(item);
  const syntax = latex.map(latexSyntaxError).filter((e): e is string => e !== null);
  checks.push({
    name: 'latex_syntax',
    result: latex.length === 0 ? 'skip' : syntax.length ? 'fail' : 'pass',
    detail: syntax[0] ?? null,
  });

  // 5. Equalities are algebraic identities.
  const solutions = item.type === 'worked_example' ? solutionsOf(latexOf(item)) : {};
  const results = identitiesOf(item)
    .map((l) => checkIdentity(l, solutions))
    .filter((r) => r !== null);
  const broken = results.find((r) => !r.holds);
  checks.push({
    name: 'identity',
    result: results.length === 0 ? 'skip' : broken ? 'fail' : 'pass',
    detail: broken?.detail ?? results[0]?.detail ?? null,
  });

  // 6. Independent image check.
  checks.push({
    name: 'image_verification',
    result: !verdict ? 'skip' : verdict.verdict === 'match' ? 'pass' : 'fail',
    detail:
      verdict && verdict.verdict !== 'match'
        ? `${verdict.verdict}${verdict.correction ? `: ${verdict.correction}` : ''}`
        : null,
  });
  return checks;
}

/**
 * textbook  — claimed as printed and confirmed (image check, or text grounding for plain prose);
 * derived   — the model's own structuring, with valid sources;
 * unverified — anything claimed as printed that the checks did not confirm.
 */
export function statusOf(item: ExtractedItem, checks: KnowledgeCheck[]): KnowledgeStatus {
  const result = (name: KnowledgeCheck['name']) =>
    checks.find((c) => c.name === name)?.result ?? 'skip';
  if (
    result('source_ids') === 'fail' ||
    result('latex_syntax') === 'fail' ||
    result('identity') === 'fail'
  )
    return 'unverified';
  if (item.origin === 'derived') return 'derived';
  if (result('block_kind') === 'fail') return 'unverified';
  if (result('image_verification') === 'pass') return 'textbook';
  const plainProse = latexOf(item).length === 0;
  if (result('image_verification') === 'skip' && plainProse && result('text_grounding') === 'pass')
    return 'textbook';
  return 'unverified';
}
