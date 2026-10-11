import katex from 'katex';
import { useMemo } from 'react';
import { cn } from '@/lib/cn';

type MathTextProps = { latex: string; display?: boolean; className?: string };

/** KaTeX-rendered LaTeX; invalid input falls back to the raw source so reviewers see it. */
export function MathText({ latex, display = false, className }: MathTextProps) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(latex, {
        displayMode: display,
        throwOnError: true,
        strict: 'ignore',
      });
    } catch {
      return null;
    }
  }, [latex, display]);
  if (html === null) {
    return <code className={cn('font-mono text-xs text-destructive', className)}>{latex}</code>;
  }
  // KaTeX escapes its input and `trust` is off, so the markup contains no user HTML.
  return (
    <span
      className={cn(display ? 'block overflow-x-auto py-1' : 'inline', className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
