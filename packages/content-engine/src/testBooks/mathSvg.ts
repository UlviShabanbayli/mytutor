import { mathjax } from '@mathjax/src/js/mathjax.js';
import { TeX } from '@mathjax/src/js/input/tex.js';
import { SVG } from '@mathjax/src/js/output/svg.js';
import { liteAdaptor } from '@mathjax/src/js/adaptors/liteAdaptor.js';
import { RegisterHTMLHandler } from '@mathjax/src/js/handlers/html.js';
import '@mathjax/src/js/util/asyncLoad/esm.js';
import '@mathjax/src/js/input/tex/base/BaseConfiguration.js';
import '@mathjax/src/js/input/tex/ams/AmsConfiguration.js';
import type { MathSvg } from '@mytutor/types';

/**
 * Formulas typeset to SVG with MathJax (TeX in, SVG out, every glyph in the SVG itself so the
 * app can draw it with no fonts). Sizes come out in ex; at MathJax's 1 ex = 0.5 em they are
 * turned into em, so the app scales them with the text around them.
 */
const EX_PER_EM = 0.5;

const adaptor = liteAdaptor();
RegisterHTMLHandler(adaptor);
const document = mathjax.document('', {
  InputJax: new TeX({ packages: ['base', 'ams'] }),
  // One SVG per formula: MathJax 4 would break a long inline formula into pieces.
  OutputJax: new SVG({ fontCache: 'none', linebreaks: { inline: false } }),
});

const exOf = (svg: string, attribute: RegExp) => Number(svg.match(attribute)?.[1] ?? NaN);

/** One formula as SVG; null when MathJax cannot read it (the question is not published). */
export async function mathSvg(latex: string): Promise<MathSvg | null> {
  let markup: string;
  try {
    markup = adaptor.outerHTML(await document.convertPromise(latex, { display: false }));
  } catch {
    return null;
  }
  if (markup.includes('data-mjx-error') || markup.includes('merror')) return null;
  // A formula broken into pieces would lose all but one: refuse it (inner <svg>s, as an
  // overline's, are part of the one formula).
  if (markup.includes('mjx-break')) return null;
  const svg = markup.match(/<svg[\s\S]*<\/svg>/)?.[0];
  if (!svg) return null;
  const width = exOf(svg, /\swidth="([\d.]+)ex"/);
  const height = exOf(svg, /\sheight="([\d.]+)ex"/);
  const align = exOf(svg, /vertical-align:\s*(-?[\d.]+)ex/);
  if (![width, height].every(Number.isFinite)) return null;
  // The app gives the size: the root tag (only it, fraction bars keep theirs) loses its own.
  const bare = svg
    .replace(/^<svg[^>]*>/, (root) =>
      root.replace(/\s(?:width|height|style|role|focusable)="[^"]*"/g, ''),
    )
    .replace(/<title>[\s\S]*?<\/title>/g, '')
    // MathJax's notes on each node (data-latex, data-c…) draw nothing.
    .replace(/\sdata-[a-z-]+="[^"]*"/g, '');
  return {
    svg: bare,
    width: width * EX_PER_EM,
    height: height * EX_PER_EM,
    depth: Number.isFinite(align) ? -align * EX_PER_EM : 0,
  };
}

/** The `$…$` formulas of a text, in order. */
export const formulasIn = (text: string) =>
  [...text.matchAll(/\$([^$]+)\$/g)].map((m) => m[1] ?? '');
