import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { KnowledgeItem, TopicSource } from '@mytutor/types';
import { LineList } from '@/components/source/LineList';
import { PageNav } from '@/components/source/PageNav';
import { PageViewer } from '@/components/source/PageViewer';
import { contentUrl } from '@/features/content/api';
import { statusTone } from './statusTone';

type ItemSourcePanelProps = { item: KnowledgeItem; source: TopicSource; topicDir: string };

/** Where an item comes from: its cited regions on the page, the crops and the cited lines. */
export function ItemSourcePanel({ item, source, topicDir }: ItemSourcePanelProps) {
  const { t } = useTranslation();
  const regions = item.sources.flatMap((s) => s.regions);
  const pageNumbers = [...new Set(regions.map((r) => r.page))];
  const pages = source.pages.filter((p) => pageNumbers.includes(p.page));
  const [chosen, setChosen] = useState<number | null>(null);
  const page = pages.find((p) => p.page === chosen) ?? pages[0];
  const lineIds = item.sources.flatMap((s) => s.lineIds);
  const lines = source.lines.filter((l) => lineIds.includes(l.id));
  const crops = [...new Set(item.sources.flatMap((s) => s.crops))];

  return (
    <div className="flex flex-col gap-3">
      {page ? (
        <>
          {pages.length > 1 ? (
            <PageNav pages={pages} current={page.page} onChange={setChosen} />
          ) : null}
          <PageViewer
            page={page}
            imageUrl={contentUrl(topicDir, page.image)}
            activeId={item.id}
            overlays={regions
              .filter((r) => r.page === page.page)
              .map((r, i) => ({
                key: `${item.id}-${i}`,
                id: item.id,
                bbox: r.bbox,
                tone: statusTone[item.status],
              }))}
          />
        </>
      ) : null}
      <section className="flex flex-col gap-2">
        <h4 className="font-sans-bold text-xs uppercase tracking-wide text-muted-foreground">
          {t('source.crops')}
        </h4>
        {crops.map((crop) => (
          <img
            key={crop}
            src={contentUrl(topicDir, crop)}
            alt={crop}
            loading="lazy"
            className="w-full rounded-sm border border-border bg-white"
          />
        ))}
      </section>
      {lines.length ? (
        <section className="flex flex-col gap-2">
          <h4 className="font-sans-bold text-xs uppercase tracking-wide text-muted-foreground">
            {t('source.lines', { count: lines.length })}
          </h4>
          <LineList lines={lines} />
        </section>
      ) : null}
    </div>
  );
}
