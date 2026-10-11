import katex from 'katex';
import { evaluate } from 'mathjs';

/** KaTeX parse check: catches malformed LaTeX before it reaches a renderer. */
export function latexSyntaxError(latex: string): string | null {
  try {
    katex.renderToString(latex, { throwOnError: true, strict: 'ignore' });
    return null;
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  }
}

// Sentinels used while rewriting, so later steps can tell constructs apart.
const SQRT = '§'; // sqrt(…)
const FRAC_OPEN = '⟨'; // fraction start: "5⟨…⟩" is a mixed number (5 + …)
const FRAC_CLOSE = '⟩';

/** Rewrites innermost `{…}` constructs until nothing changes. */
function rewriteBraces(input: string): string {
  const inner = '\\{([^{}]*)\\}';
  const rules: [RegExp, string][] = [
    [
      new RegExp(`\\\\(?:d|t)?frac\\s*${inner}\\s*${inner}`, 'g'),
      `${FRAC_OPEN}($1)/($2)${FRAC_CLOSE}`,
    ],
    [new RegExp(`\\\\sqrt\\s*${inner}`, 'g'), `${SQRT}($1)`],
    [
      new RegExp(`\\\\(?:underbrace|overbrace)\\s*${inner}\\s*[_^]\\s*(?:${inner}|\\w)`, 'g'),
      '($1)',
    ],
    [
      new RegExp(
        `\\\\(?:underbrace|overbrace|underline|overline|boxed|mathrm|text|textbf|mathbf)\\s*${inner}`,
        'g',
      ),
      '($1)',
    ],
    [new RegExp(`\\^\\s*${inner}`, 'g'), '^($1)'],
    [new RegExp(inner, 'g'), '($1)'],
  ];
  let out = input;
  for (let prev = ''; prev !== out;) {
    prev = out;
    for (const [re, to] of rules) out = out.replace(re, to);
  }
  return out;
}

/** "0{,}1(2)" style repeating decimals (digits only in the brackets) → their exact value. */
function repeatingDecimals(s: string): string {
  return s.replace(/(\d+)\.(\d*)\((\d+)\)/g, (_, int: string, fixed: string, period: string) => {
    const tail =
      (Number(fixed + period) - Number(fixed || '0')) /
      (10 ** fixed.length * (10 ** period.length - 1));
    return `(${Number(int) + tail})`;
  });
}

/** "−1⟨5/12⟩" is −(1 + 5/12): wrap a mixed number so a leading sign applies to all of it. */
function mixedNumbers(s: string): string {
  let out = '';
  let i = 0;
  const lead = new RegExp(`(?<![\\^.\\d])(\\d+)${FRAC_OPEN}`, 'g');
  for (let m = lead.exec(s); m; m = lead.exec(s)) {
    let depth = 0;
    let end = m.index + (m[1]?.length ?? 0);
    for (; end < s.length; end++) {
      if (s[end] === FRAC_OPEN) depth++;
      if (s[end] === FRAC_CLOSE && --depth === 0) break;
    }
    const whole = m[1] ?? '';
    const frac = s.slice(m.index + whole.length, end + 1);
    // Only numeric fractions form mixed numbers; "2\frac{x}{3}" is 2 · x/3.
    const mixed = !/[a-zA-Z]/.test(frac);
    out += s.slice(i, m.index) + (mixed ? `(${whole}+${frac})` : `${whole}*${frac}`);
    i = end + 1;
    lead.lastIndex = i;
  }
  return out + s.slice(i);
}

/**
 * Converts school-algebra LaTeX to a mathjs expression, or null when it contains anything this
 * checker does not understand (the identity check is then skipped, not failed). Variables are
 * single lowercase letters, as in the textbook: "2ab" means 2·a·b. Capital letters name points
 * and segments ("AB = AM + MB"), which are not algebra, so they are skipped too.
 */
export function latexToMath(latex: string): string | null {
  let s = latex
    .replace(/\\(?:text|textrm|mathrm)\s*\{[^{}]*\}/g, ' ') // units and words: "1440 \text{ (man)}"
    .replace(/\\(?:left|right|displaystyle|quad|qquad)(?![a-zA-Z])|\\[,;:! ]/g, ' ')
    .replace(/\{,\}/g, '.') // decimal comma written as {,}
    .replace(/(\d),(\d)/g, '$1.$2')
    .replace(/\\(?:cdot|times|ast)(?![a-zA-Z])|·|∙/g, '*')
    .replace(/\\div(?![a-zA-Z])/g, '/')
    .replace(/[−–]/g, '-');
  s = repeatingDecimals(rewriteBraces(s).replace(/\s+/g, ''));
  s = mixedNumbers(s);
  if (new RegExp(`[^0-9a-z+\\-*/^().${SQRT}${FRAC_OPEN}${FRAC_CLOSE}]`).test(s)) return null;
  // Implicit multiplication: 2a, ab, a(…), )(, )a, 2√…
  s = s.replace(new RegExp(`([0-9a-z)${FRAC_CLOSE}])(?=[a-z(${FRAC_OPEN}${SQRT}])`, 'g'), '$1*');
  return s.replaceAll(SQRT, 'sqrt').replaceAll(FRAC_OPEN, '(').replaceAll(FRAC_CLOSE, ')');
}

/** Splits "x = 4,\ CG = 4" or "a = 1;\quad b = 2" into separate statements. */
export function statementsOf(latex: string): string[] {
  return latex
    .split(/,\s*\\(?:[ ,;]|q?quad(?![a-zA-Z]))|;|\\q?quad(?![a-zA-Z])/)
    .map((t) => t.trim())
    .filter(Boolean);
}

/** Values an example's steps settle on: "x = 8", "y = 2 \cdot 2 = 4". */
export function solutionsOf(latexes: string[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const statement of latexes.flatMap(statementsOf)) {
    const sides = statement.split('=').map((t) => t.trim());
    const name = sides[0];
    const last = latexToMath(sides.at(-1) ?? '');
    if (sides.length < 2 || !name || !/^[a-z]$/.test(name) || !last || /[a-z]/.test(last)) continue;
    try {
      const value = Number(evaluate(last));
      if (Number.isFinite(value)) out[name] = value;
    } catch {
      // not a number
    }
  }
  return out;
}

type IdentityResult = { holds: boolean; detail: string };

/**
 * Numeric identity check for an equality chain "A = B = C": every side must evaluate to the
 * same value for several assignments of the variables. `\pm`/`\mp` are tried with both signs.
 * Several statements ("x = 4,\ y = 3") are checked one by one. Returns null when the text is
 * not an equality this checker can evaluate.
 *
 * `solutions` (from a worked example's own steps, e.g. "x = 8") turn equations into checks:
 * "x = \frac{x+8}{2}" is not an identity, but it must hold for x = 8.
 */
export function checkIdentity(
  latex: string,
  solutions: Record<string, number> = {},
): IdentityResult | null {
  const results = statementsOf(latex)
    .map((statement) => checkStatement(statement, solutions))
    .filter((r) => r !== null);
  return results.find((r) => !r.holds) ?? results[0] ?? null;
}

function checkStatement(latex: string, solutions: Record<string, number>): IdentityResult | null {
  if (!latex.includes('=')) return null;
  const variants = /\\pm|\\mp/.test(latex)
    ? [
        latex.replace(/\\pm/g, '+').replace(/\\mp/g, '-'),
        latex.replace(/\\pm/g, '-').replace(/\\mp/g, '+'),
      ]
    : [latex];
  for (const variant of variants) {
    const raw = variant.split('=');
    const sides = raw.map((side) => latexToMath(side));
    if (sides.length < 2 || sides.some((side) => !side)) return null;
    const vars = [
      ...new Set(
        sides
          .join('')
          .replace(/sqrt/g, '')
          .match(/[a-zA-Z]/g) ?? [],
      ),
    ];
    // An equation (or a step that assigns the solution) is checked with the example's solution.
    const solved = vars.length > 0 && vars.every((v) => v in solutions);
    for (let trial = 0; trial < (solved ? 1 : 5); trial++) {
      const scope = Object.fromEntries(
        vars.map((v, i) => [v, solved ? (solutions[v] ?? 0) : 1.3 + trial * 0.7 + i * 0.37]),
      );
      let values: number[];
      try {
        values = sides.map((side) => Number(evaluate(side ?? '', scope)));
      } catch {
        return null;
      }
      if (values.some((v) => !Number.isFinite(v))) return null;
      const first = values[0] ?? 0;
      const bad = values.findIndex(
        (v) => Math.abs(v - first) > 1e-6 * Math.max(1, Math.abs(first)),
      );
      if (bad > 0) return { holds: false, detail: `"${raw[0]?.trim()}" ≠ "${raw[bad]?.trim()}"` };
    }
    if (solved)
      return {
        holds: true,
        detail: `tənlik həlli ilə yoxlandı (${vars.map((v) => `${v} = ${solutions[v]}`).join(', ')})`,
      };
  }
  if (!/[a-z]/.test(latexToMath(latex) ?? ''))
    return { holds: true, detail: 'hesablama düzgündür' };
  return {
    holds: true,
    detail: `${variants.length > 1 ? 'hər iki işarə ilə, ' : ''}5 qiymət dəstində bərabərdir`,
  };
}
