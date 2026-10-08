import { useTranslation } from 'react-i18next';
import type { KnowledgeDocument } from '@mytutor/types';
import { StatCard } from '@/components/ui';
import { callStats } from '@/features/knowledge/items';

const fmt = new Intl.NumberFormat('en-US');

export function KnowledgeStats({ doc }: { doc: KnowledgeDocument }) {
  const { t } = useTranslation();
  const s = doc.summary;
  const calls = callStats(doc);
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-7">
      <StatCard label={t('knowledge.stats.textbook')} value={s.textbook} tone="success" />
      <StatCard label={t('knowledge.stats.derived')} value={s.derived} tone="accent" />
      <StatCard label={t('knowledge.stats.unverified')} value={s.unverified} tone="destructive" />
      <StatCard
        label={t('knowledge.stats.failed')}
        value={calls.failedItems}
        tone={calls.failedItems ? 'destructive' : 'success'}
      />
      <StatCard label={t('knowledge.stats.imageFormulas')} value={s.imageBasedFormulas.length} />
      <StatCard
        label={t('knowledge.stats.aiCalls')}
        value={calls.total}
        detail={t('knowledge.stats.aiCallsDetail', { fresh: calls.fresh, cached: calls.cached })}
      />
      <StatCard
        label={t('knowledge.stats.cost')}
        value={`$${s.costUsd.toFixed(2)}`}
        detail={t('knowledge.stats.tokens', {
          input: fmt.format(calls.inputTokens),
          output: fmt.format(calls.outputTokens),
        })}
      />
    </div>
  );
}
