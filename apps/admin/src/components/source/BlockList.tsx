import { ImageIcon, Sigma, TriangleAlert } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { SourceBlock } from '@mytutor/types';
import { dotTone } from '@/components/ui/tones';
import { categoryOf, flattenBlockTree } from '@/features/source/blocks';
import { cn } from '@/lib/cn';
import { useBlockLabel } from './BlockLabel';
import { categoryTone } from './categoryTone';

type BlockListProps = {
  blocks: SourceBlock[];
  activeId: string | null;
  onSelect: (id: string) => void;
};

const INDENT = ['pl-2', 'pl-6', 'pl-10', 'pl-14'];

export function BlockList({ blocks, activeId, onSelect }: BlockListProps) {
  const { t } = useTranslation();
  const label = useBlockLabel();
  const listRef = useRef<HTMLUListElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  // Scroll only the list (not the window) so a block picked on the page is visible here.
  useEffect(() => {
    const list = listRef.current;
    const row = activeRef.current;
    if (!list || !row) return;
    const offset = row.getBoundingClientRect().top - list.getBoundingClientRect().top;
    if (offset < 0 || offset > list.clientHeight - row.offsetHeight) {
      list.scrollTop += offset - (list.clientHeight - row.offsetHeight) / 2;
    }
  }, [activeId]);

  return (
    <ul
      ref={listRef}
      className="flex max-h-[40dvh] flex-col gap-0.5 overflow-y-auto"
      aria-label={t('source.blocks')}
    >
      {flattenBlockTree(blocks).map(({ block, depth }) => {
        const active = block.id === activeId;
        return (
          <li key={block.id}>
            <button
              ref={active ? activeRef : undefined}
              type="button"
              aria-pressed={active}
              onClick={() => onSelect(block.id)}
              className={cn(
                'flex min-h-9 w-full cursor-pointer items-center gap-2 rounded-sm pr-2 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                INDENT[Math.min(depth, INDENT.length - 1)],
                active
                  ? 'bg-secondary text-secondary-foreground'
                  : 'text-foreground hover:bg-muted',
              )}
            >
              <span
                className={cn(
                  'size-2 shrink-0 rounded-full',
                  dotTone[categoryTone[categoryOf(block.kind)]],
                )}
                aria-hidden
              />
              <span className="min-w-0 flex-1 truncate">{label(block)}</span>
              <span className="flex shrink-0 items-center gap-1 text-muted-foreground">
                {block.flags.hasMath ? (
                  <Sigma className="size-3.5" aria-label={t('source.flags.hasMath')} />
                ) : null}
                {block.flags.hasFigure ? (
                  <ImageIcon className="size-3.5" aria-label={t('source.flags.hasFigure')} />
                ) : null}
                {block.flags.lowTextQuality ? (
                  <TriangleAlert
                    className="size-3.5 text-accent"
                    aria-label={t('source.flags.lowTextQuality')}
                  />
                ) : null}
              </span>
              <code className="shrink-0 font-mono text-[11px] text-muted-foreground">
                {block.id}
              </code>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
