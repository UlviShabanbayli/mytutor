import { Camera, FileText, TriangleAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { KnowledgeItem, TopicSource } from '@mytutor/types';
import { Badge } from '@/components/ui';
import { useBlockLabel } from '@/components/source/BlockLabel';
import { hasFailedCheck, toExtracted } from '@/features/knowledge/items';
import { cn } from '@/lib/cn';
import { CheckList } from './CheckList';
import { KnowledgeItemBody } from './KnowledgeItemBody';
import { statusTone } from './statusTone';

type KnowledgeItemCardProps = {
  item: KnowledgeItem;
  source: TopicSource;
  active: boolean;
  onSelect: (id: string) => void;
};

export function KnowledgeItemCard({ item, source, active, onSelect }: KnowledgeItemCardProps) {
  const { t } = useTranslation();
  const blockLabel = useBlockLabel();
  const extracted = toExtracted(item);
  const failed = hasFailedCheck(item);

  return (
    <article
      className={cn(
        'flex min-w-0 flex-col gap-3 rounded-lg border bg-card p-4 transition-colors',
        active ? 'border-primary ring-2 ring-primary/30' : 'border-border',
      )}
    >
      <header className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={() => onSelect(item.id)}
          aria-pressed={active}
          className="cursor-pointer rounded-sm font-mono text-xs text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {item.id}
        </button>
        <Badge tone="primary">{t(`knowledge.type.${item.type}`)}</Badge>
        <Badge tone={statusTone[item.status]}>{t(`knowledge.status.${item.status}`)}</Badge>
        <Badge
          icon={
            item.readFrom === 'image' ? (
              <Camera className="size-3" />
            ) : (
              <FileText className="size-3" />
            )
          }
        >
          {t(`knowledge.readFrom.${item.readFrom}`)}
        </Badge>
        {item.claimedOrigin === 'textbook' && item.status !== 'textbook' ? (
          <Badge tone="accent" icon={<TriangleAlert className="size-3" />}>
            {t('knowledge.claimedTextbook')}
          </Badge>
        ) : null}
      </header>

      <div className="min-w-0 text-foreground">
        {extracted ? (
          <KnowledgeItemBody item={extracted} />
        ) : (
          <div className="flex flex-col gap-1">
            <p className="text-xs text-destructive">{t('knowledge.rawContent')}</p>
            <pre className="overflow-x-auto rounded-sm bg-muted p-2 font-mono text-xs">
              {JSON.stringify(item.content, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        <span className="text-muted-foreground">{t('knowledge.sources')}:</span>
        {item.sources.map((s, i) => {
          const block = source.blocks.find((b) => b.id === s.blockId);
          const pages = [...new Set(s.regions.map((r) => r.printedPage ?? r.page))];
          return (
            <button
              key={`${s.blockId}-${i}`}
              type="button"
              onClick={() => onSelect(item.id)}
              className="cursor-pointer rounded-full bg-muted px-2 py-0.5 text-foreground hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <code className="font-mono">{s.blockId}</code>
              {block ? ` · ${blockLabel(block)}` : ''}
              {s.lineIds.length
                ? ` · ${t('knowledge.lineCount', { count: s.lineIds.length })}`
                : ''}
              {s.figureId ? ` · ${s.figureId}` : ''}
              {` · ${pages.map((p) => t('common.printedPage', { page: p })).join(', ')}`}
            </button>
          );
        })}
      </div>

      <details open={failed} className="group">
        <summary
          className={cn(
            'cursor-pointer select-none font-sans-bold text-xs',
            failed ? 'text-destructive' : 'text-muted-foreground',
          )}
        >
          {t('knowledge.checks')}
        </summary>
        <div className="pt-2">
          <CheckList checks={item.checks} />
        </div>
      </details>
    </article>
  );
}
