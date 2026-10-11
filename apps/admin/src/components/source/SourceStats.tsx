import { useTranslation } from 'react-i18next';
import type { TopicSource } from '@mytutor/types';
import { StatCard } from '@/components/ui';

export function SourceStats({ source }: { source: TopicSource }) {
  const { t } = useTranslation();
  const printed = source.pages.map((p) => p.printedPage ?? p.page);
  const range =
    printed.length > 1 ? `${printed[0]}–${printed[printed.length - 1]}` : String(printed[0] ?? '');
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
      <StatCard
        label={t('source.stats.pages')}
        value={range}
        detail={t('source.parser', { version: source.parserVersion })}
      />
      <StatCard label={t('source.stats.blocks')} value={source.blocks.length} />
      <StatCard label={t('source.stats.lines')} value={source.lines.length} />
      <StatCard label={t('source.stats.figures')} value={source.figures.length} />
      <StatCard
        label={t('source.stats.warnings')}
        value={source.warnings.length}
        tone={source.warnings.length ? 'accent' : 'success'}
      />
    </div>
  );
}
