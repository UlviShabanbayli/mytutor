// Checks a typed algebraic answer ("a³ + 9a²b + 27ab² + 27b³") against the book's answer: the
// same terms in any order, any spacing, with "-" or "−", "^2" or "²", and "*" or "·".

const SUPERSCRIPT: Record<string, string> = { '2': '²', '3': '³' };

/** "^2", "^(2)", "^3", "^(3)". */
const POWER = /\^\(([23])\)|\^([23])/g;

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[-‐‑–]/g, '−')
    .replace(POWER, (_, a?: string, b?: string) => SUPERSCRIPT[a ?? b ?? ''] ?? '')
    .replace(/[*·×]/g, '');
}

/** A term with its factors in a fixed order: "9ba²" and "9a²b" both become "9a²b". */
function canonicalTerm(term: string): string {
  const match = /^(\d*)((?:[a-z][²³]?)*)$/.exec(term);
  if (!match || term === '') return term;
  const [, coefficient = '', letters = ''] = match;
  const powers = new Map<string, number>();
  for (const [, letter = '', power] of letters.matchAll(/([a-z])([²³]?)/g)) {
    powers.set(letter, (powers.get(letter) ?? 0) + (power === '²' ? 2 : power === '³' ? 3 : 1));
  }
  const factors = [...powers.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(
      ([letter, power]) =>
        letter + (power === 1 ? '' : (SUPERSCRIPT[String(power)] ?? `^${power}`)),
    )
    .join('');
  const number = coefficient === '' || (coefficient === '1' && factors) ? '' : coefficient;
  return number + factors;
}

/** Signed terms of a sum without brackets, e.g. ["+a³", "−3a²b"]; null when brackets remain. */
function terms(expression: string): string[] | null {
  if (/[()]/.test(expression)) return null;
  const parts = expression.match(/[+−]?[^+−]+/g) ?? [];
  return parts
    .map((part) => {
      const sign = part.startsWith('−') ? '−' : '+';
      return sign + canonicalTerm(part.replace(/^[+−]/, ''));
    })
    .sort();
}

export function sameExpression(given: string, expected: string): boolean {
  const a = normalize(given);
  const b = normalize(expected);
  if (a === '' || b === '') return false;
  if (a === b) return true;
  const ta = terms(a);
  const tb = terms(b);
  return ta !== null && tb !== null && ta.join('') === tb.join('');
}

/** What the student typed, shown the way it is printed: "a^2 - b" → "a² − b". */
export function prettyExpression(text: string): string {
  return text
    .replace(POWER, (_, a?: string, b?: string) => SUPERSCRIPT[a ?? b ?? ''] ?? '')
    .replace(/-/g, '−');
}
