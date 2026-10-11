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

/**
 * Converts school-algebra LaTeX to a mathjs expression, or null when it contains anything this
 * checker does not understand (the identity check is then skipped, not failed). Variables are
 * single letters, as in the textbook: "2ab" means 2·a·b.
 */
export function latexToMath(latex: string): string | null {
  let s = latex
    .replace(/\\(?:left|right|displaystyle|,|;|!|quad)/g, ' ')
    .replace(/\{,\}/g, '.') // decimal comma written as {,}
    .replace(/(\d),(\d)/g, '$1.$2')
    .replace(/\\(?:cdot|times|ast)|·|∙/g, '*')
    .replace(/\\div/g, '/')
    .replace(/[−–]/g, '-');
  s = rewriteBraces(s).replace(/\s+/g, '');
  s = s.replace(new RegExp(`(\\d)${FRAC_OPEN}`, 'g'), `$1+${FRAC_OPEN}`); // mixed number
  if (new RegExp(`[^0-9a-zA-Z+\\-*/^().${SQRT}${FRAC_OPEN}${FRAC_CLOSE}]`).test(s)) return null;
  // Implicit multiplication: 2a, ab, a(…), )(, )a, 2√…
  s = s.replace(
    new RegExp(`([0-9a-zA-Z)${FRAC_CLOSE}])(?=[a-zA-Z(${FRAC_OPEN}${SQRT}])`, 'g'),
    '$1*',
  );
  return s.replaceAll(SQRT, 'sqrt').replaceAll(FRAC_OPEN, '(').replaceAll(FRAC_CLOSE, ')');
}

/**
 * Numeric identity check for an equality chain "A = B = C": every side must evaluate to the
 * same value for several assignments of the variables. `\pm`/`\mp` are tried with both signs.
 * Returns null when the text is not an equality this checker can evaluate.
 */
export function checkIdentity(latex: string): { holds: boolean; detail: string } | null {
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
    for (let trial = 0; trial < 5; trial++) {
      const scope = Object.fromEntries(vars.map((v, i) => [v, 1.3 + trial * 0.7 + i * 0.37]));
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
  }
  return {
    holds: true,
    detail: `${variants.length > 1 ? 'hər iki işarə ilə, ' : ''}5 qiymət dəstində bərabərdir`,
  };
}
