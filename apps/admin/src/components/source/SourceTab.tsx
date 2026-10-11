import { MousePointerClick, TriangleAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { TopicSource } from '@mytutor/types';
import { Card, EmptyState } from '@/components/ui';
import { contentUrl } from '@/features/content/api';
import { blockOverlays, firstPageOf } from '@/features/source/blocks';
import { useSearchParam } from '@/lib/useSearchParam';
import { useBlockLabel } from './BlockLabel';
import { BlockDetail } from './BlockDetail';
import { BlockList } from './BlockList';
import { CategoryLegend } from './CategoryLegend';
import { categoryTone } from './categoryTone';
import { PageNav } from './PageNav';
import { PageViewer } from './PageViewer';
import { SourceStats } from './SourceStats';

type SourceTabProps = { source: TopicSource; topicDir: string };

export function SourceTab({ source, topicDir }: SourceTabProps) {
  const { t } = useTranslation();
  const label = useBlockLabel();
  const [blockId, setParams] = useSearchParam('block');
  const [pageParam] = useSearchParam('page');
  const block = source.blocks.find((b) => b.id === blockId) ?? null;
  const pageNumber = Number(pageParam) || (block && firstPageOf(block)) || source.pages[0]?.page;
  const page = source.pages.find((p) => p.page === pageNumber) ?? source.pages[0];

  const selectFromList = (id: string) => {
    const target = source.blocks.find((b) => b.id === id);
    const first = target ? firstPageOf(target) : null;
    setParams({ block: id, page: first === null ? null : String(first) });
  };

  return (
    <div className="flex flex-col gap-4">
      <SourceStats source={source} />
      {source.warnings.length ? (
        <Card className="flex flex-col gap-1 border-accent/60 p-4">
          <h3 className="flex items-center gap-2 font-sans-bold text-sm text-foreground">
            <TriangleAlert className="size-4 text-accent" />
            {t('source.warningsTitle')}
          </h3>
          <ul className="list-disc pl-5 text-sm text-muted-foreground">
            {source.warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </Card>
      ) : null}

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,720px)_minmax(0,1fr)]">
        {page ? (
          <section className="flex flex-col gap-3 lg:sticky lg:top-20">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <PageNav
                pages={source.pages}
                current={page.page}
                onChange={(p) => setParams({ page: String(p) })}
              />
              <CategoryLegend />
            </div>
            <PageViewer
              page={page}
              imageUrl={contentUrl(topicDir, page.image)}
              activeId={blockId}
              onSelect={(id) => setParams({ block: id })}
              overlays={blockOverlays(source, page.page).map((o, i) => {
                const b = source.blocks.find((x) => x.id === o.id);
                return {
                  key: `${o.id}-${i}`,
                  id: o.id,
                  bbox: o.region.bbox,
                  tone: categoryTone[o.category],
                  dashed: o.container,
                  label: b ? `${b.id} · ${label(b)}` : o.id,
                };
              })}
            />
          </section>
        ) : null}

        <div className="flex min-w-0 flex-col gap-4">
          <Card className="flex flex-col gap-2 p-2">
            <h3 className="px-2 pt-2 font-sans-bold text-sm text-foreground">
              {t('source.blocks')}{' '}
              <span className="text-muted-foreground">{source.blocks.length}</span>
            </h3>
            <BlockList blocks={source.blocks} activeId={blockId} onSelect={selectFromList} />
          </Card>
          <Card className="p-4">
            {block ? (
              <BlockDetail key={block.id} block={block} source={source} topicDir={topicDir} />
            ) : (
              <EmptyState
                className="border-none py-6"
                icon={<MousePointerClick className="size-6" />}
                title={t('source.selectBlock')}
                body={t('source.selectBlockBody')}
              />
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
