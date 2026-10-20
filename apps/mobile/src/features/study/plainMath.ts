/*
 * The book's lesson texts write mathematics as LaTeX between single dollar signs. The app has
 * no typesetter for free text, so formulas are shown as printed-style plain text: powers and
 * indices as superscript and subscript digits, fractions with a slash, the usual symbols.
 */

const SUPERSCRIPT: Record<string, string> = {
  '0': '⁰',
  '1': '¹',
  '2': '²',
  '3': '³',
  '4': '⁴',
  '5': '⁵',
  '6': '⁶',
  '7': '⁷',
  '8': '⁸',
  '9': '⁹',
  '+': '⁺',
  '−': '⁻',
  '-': '⁻',
  '(': '⁽',
  ')': '⁾',
  '=': '⁼',
  ...Object.fromEntries(
    [...'abcdefghijklmnoprstuvwxyz'].map((c, i) => [c, [...'ᵃᵇᶜᵈᵉᶠᵍʰⁱʲᵏˡᵐⁿᵒᵖʳˢᵗᵘᵛʷˣʸᶻ'][i] ?? c]),
  ),
};

const SUBSCRIPT: Record<string, string> = {
  '0': '₀',
  '1': '₁',
  '2': '₂',
  '3': '₃',
  '4': '₄',
  '5': '₅',
  '6': '₆',
  '7': '₇',
  '8': '₈',
  '9': '₉',
  '+': '₊',
  '−': '₋',
  '-': '₋',
  n: 'ₙ',
  m: 'ₘ',
  k: 'ₖ',
  x: 'ₓ',
};

const SYMBOLS: Record<string, string> = {
  cdot: '·',
  times: '×',
  div: ':',
  pm: '±',
  mp: '∓',
  le: '≤',
  leq: '≤',
  ge: '≥',
  geq: '≥',
  ne: '≠',
  neq: '≠',
  approx: '≈',
  infty: '∞',
  pi: 'π',
  alpha: 'α',
  beta: 'β',
  gamma: 'γ',
  angle: '∠',
  triangle: '△',
  circ: '°',
  degree: '°',
  in: '∈',
  notin: '∉',
  cup: '∪',
  cap: '∩',
  emptyset: '∅',
  varnothing: '∅',
  to: '→',
  rightarrow: '→',
  Rightarrow: '⇒',
  Leftrightarrow: '⇔',
  parallel: '∥',
  perp: '⊥',
  ldots: '…',
  dots: '…',
  cdots: '⋯',
  quad: ' ',
  qquad: ' ',
};

/** Superscript or subscript form of a short text, or null when a character has none. */
function script(text: string, table: Record<string, string>): string | null {
  const out = [...text.replace(/\s+/g, '')].map((c) => table[c]);
  return out.every((c) => c !== undefined) ? out.join('') : null;
}

/** "(a + 1)" for a compound part of a fraction, "a" for a simple one. */
const grouped = (part: string) => (/^[\w.,′]+$/u.test(part) ? part : `(${part})`);

/** Rewrites the innermost `{…}` constructs until nothing changes. */
function rewrite(input: string): string {
  const inner = '\\{([^{}]*)\\}';
  const rules: [RegExp, (...groups: string[]) => string][] = [
    [
      new RegExp(`\\\\[dt]?frac\\s*${inner}\\s*${inner}`, 'g'),
      (_, a = '', b = '') => `${grouped(a)}/${grouped(b)}`,
    ],
    [new RegExp(`\\\\sqrt\\s*${inner}`, 'g'), (_, a = '') => `√${grouped(a)}`],
    [
      new RegExp(`\\\\(?:text|mathrm|mathbf|textbf|operatorname)\\s*${inner}`, 'g'),
      (_, a = '') => a,
    ],
    [new RegExp(`\\^\\s*${inner}`, 'g'), (_, a = '') => script(a, SUPERSCRIPT) ?? `^(${a})`],
    [new RegExp(`_\\s*${inner}`, 'g'), (_, a = '') => script(a, SUBSCRIPT) ?? `_(${a})`],
    [new RegExp(inner, 'g'), (_, a = '') => a],
  ];
  let out = input;
  for (let previous = ''; previous !== out;) {
    previous = out;
    for (const [re, to] of rules) out = out.replace(re, (...m: string[]) => to(...m));
  }
  return out;
}

/** One formula (the text between the dollar signs) as plain text. */
export function plainFormula(latex: string): string {
  let s = latex
    .replace(/\{,\}/g, ',')
    .replace(/\\left|\\right/g, '')
    .replace(/\\[,;:! ]/g, ' ')
    .replace(/\\%/g, '%')
    .replace(/\^\s*\\circ/g, '°');
  s = s.replace(/\\([A-Za-z]+)/g, (whole, name: string) => SYMBOLS[name] ?? whole);
  s = rewrite(s);
  // A single character after ^ or _ without braces.
  s = s.replace(/\^([0-9A-Za-z+−-])/g, (_, c: string) => SUPERSCRIPT[c] ?? `^${c}`);
  s = s.replace(/_([0-9A-Za-z])/g, (_, c: string) => SUBSCRIPT[c] ?? `_${c}`);
  return s
    .replace(/\\([A-Za-z]+)/g, '$1')
    .replace(/-/g, '−')
    .replace(/\s+/g, ' ')
    .trim();
}

/** A paragraph with its `$…$` formulas written as plain text. */
export function plainMath(text: string): string {
  return text.replace(/\$([^$]+)\$/g, (_, latex: string) => plainFormula(latex));
}
