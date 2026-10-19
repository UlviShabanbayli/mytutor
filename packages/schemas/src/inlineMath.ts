/**
 * Plain-text fields of extracted knowledge (a figure's description and labels, a rule's
 * statement, an exercise's instruction) may carry LaTeX without delimiters: "Bank
 * -2\frac{1}{4} nöqtəsində". Every renderer splits such text into prose and math runs and
 * typesets the math, so a reader never sees the code. Unicode mathematics ("−2¼", "x²", "√5")
 * stays prose.
 */
export type InlinePart = { math: boolean; text: string };

const LETTER = /[A-Za-z]/;
/** Characters that belong to a number or sign written right before a math run ("-2\frac…"). */
const LEADING = /[\d.,+\-−–(]/;

/** End of the balanced group opening at `start` ("{", "[" or "("), or -1 when unclosed. */
function groupEnd(text: string, start: number): number {
  const open = text[start];
  const close = open === '{' ? '}' : open === '[' ? ']' : ')';
  let depth = 0;
  for (let i = start; i < text.length; i++) {
    if (text[i] === open) depth++;
    else if (text[i] === close && --depth === 0) return i + 1;
  }
  return -1;
}

/** End of a script argument after "^" or "_": a braced group or a single character. */
function scriptEnd(text: string, at: number): number {
  if (text[at] === '{') {
    const end = groupEnd(text, at);
    return end === -1 ? text.length : end;
  }
  return at < text.length ? at + 1 : at;
}

/** End of the math run that starts with a command or script at `start`. */
function runEnd(text: string, start: number): number {
  let i = start;
  for (;;) {
    if (text[i] === '\\' && LETTER.test(text[i + 1] ?? '')) {
      i += 1;
      while (LETTER.test(text[i] ?? '')) i++;
    } else if (text[i] === '^' || text[i] === '_') {
      i = scriptEnd(text, i + 1);
    } else if (text[i] === '{' || (text[i] === '[' && i > start)) {
      const end = groupEnd(text, i);
      i = end === -1 ? text.length : end;
    } else break;
  }
  return i;
}

/** Where a script's base starts: the word, number or bracketed group right before "^"/"_". */
function baseStart(text: string, at: number): number {
  let i = at;
  if (text[i - 1] === ')') {
    let depth = 0;
    for (let j = i - 1; j >= 0; j--) {
      if (text[j] === ')') depth++;
      else if (text[j] === '(' && --depth === 0) return j;
    }
    return i;
  }
  while (i > 0 && /[A-Za-z0-9]/.test(text[i - 1] ?? '')) i--;
  return i;
}

/** Splits text into prose and inline LaTeX runs, in order; text without LaTeX is one prose part. */
export function splitInlineMath(text: string): InlinePart[] {
  const parts: InlinePart[] = [];
  let prose = 0;
  let i = 0;
  while (i < text.length) {
    const command = text[i] === '\\' && LETTER.test(text[i + 1] ?? '');
    const script =
      (text[i] === '^' || text[i] === '_') && i > 0 && /[A-Za-z0-9)]/.test(text[i - 1] ?? '');
    if (!command && !script) {
      i++;
      continue;
    }
    let start = command ? i : baseStart(text, i);
    // A sign or number written against the run is part of it: "-2\frac{1}{4}".
    while (start > prose && LEADING.test(text[start - 1] ?? '')) start--;
    // A run never reaches back into the one before it.
    start = Math.max(start, prose);
    const end = runEnd(text, i);
    if (start > prose) parts.push({ math: false, text: text.slice(prose, start) });
    parts.push({ math: true, text: text.slice(start, end) });
    prose = end;
    i = Math.max(end, i + 1);
  }
  if (prose < text.length) parts.push({ math: false, text: text.slice(prose) });
  return parts.length ? parts : [{ math: false, text }];
}
