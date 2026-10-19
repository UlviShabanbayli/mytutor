import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { TopicSource } from '@mytutor/types';
import { type Overlay, PageViewer } from '@/components/source/PageViewer';
import { contentUrl } from '@/features/content/api';
import type { ReviewBlock } from '@/features/review/queue';
import { BlockQueueList } from './BlockQueueList';

type PagePanelProps = {
  source: TopicSource;
  topicDir: string;
  queue: ReviewBlock[];
  current: string | null;
  onSelect: (blockId: string) => void;
};

const pageOf = (block: ReviewBlock) => block.block?.regions[0]?.page ?? null;

/** The textbook page of the current block, its blocks marked by review state, and their list. */
export function PagePanel({ source, topicDir, queue, current, onSelect }: PagePanelProps) {
  const { t } = useTranslation();
  const currentBlock = queue.find((b) => b.id === current);
  const pages = source.pages.map((p) => p.page);
  const [pageNumber, setPageNumber] = useState(
    (currentBlock && pageOf(currentBlock)) ?? pages[0] ?? 0,
  );
  const page = source.pages.find((p) => p.page === pageNumber) ?? source.pages[0];
  if (!page) return null;
  const at = pages.indexOf(page.page);
  const onPage = queue.filter((b) => b.block?.regions.some((r) => r.page === page.page));
  const overlays: Overlay[] = onPage.flatMap((b) =>
    (b.block?.regions ?? [])
      .filter((r) => r.page === page.page)
      .map((r, i) => ({
        key: `${b.id}-${i}`,
        id: b.id,
        bbox: r.bbox,
        tone:
          b.id === current
            ? 'primary'
            : b.approved
              ? 'success'
              : b.problems
                ? 'destructive'
                : 'neutral',
        label: b.id,
      })),
  );
  const label = (n: number) =>
    t('common.printedPage', { page: source.pages.find((p) => p.page === n)?.printedPage ?? n });

  return (
    <section
      aria-label={label(page.page)}
      className="flex flex-col gap-2.5 rounded-lg border border-border bg-card p-3.5"
    >
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          aria-label={t('source.previousPage')}
          disabled={at <= 0}
          onClick={() => setPageNumber(pages[at - 1] ?? page.page)}
          className="flex size-9 items-center justify-center rounded-[10px] border border-border text-foreground hover:bg-muted disabled:opacity-40"
        >
          <ChevronLeft className="size-4" />
        </button>
        <span className="flex-1 text-center text-sm font-sans-black text-foreground">
          {label(page.page)}{' '}
          <span className="font-sans-medium text-muted-foreground">
            ({at + 1}/{pages.length})
          </span>
        </span>
        <button
          type="button"
          aria-label={t('source.nextPage')}
          disabled={at >= pages.length - 1}
          onClick={() => setPageNumber(pages[at + 1] ?? page.page)}
          className="flex size-9 items-center justify-center rounded-[10px] border border-border text-foreground hover:bg-muted disabled:opacity-40"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
      <PageViewer
        page={page}
        imageUrl={contentUrl(topicDir, page.image)}
        overlays={overlays}
        activeId={current}
        onSelect={onSelect}
      />
      <BlockQueueList blocks={onPage} current={current} onSelect={onSelect} />
    </section>
  );
}
