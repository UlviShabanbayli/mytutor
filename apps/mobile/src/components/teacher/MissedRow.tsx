import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui';
import type { ClassInsights } from '@mytutor/types';

type MissedRowProps = { item: ClassInsights['missed'][number] };

/** A question many students got wrong, with its source and the count. */
export function MissedRow({ item }: MissedRowProps) {
  const { t } = useTranslation();
  const count = t('teacher.insights.missedCount', { wrong: item.wrong, total: item.total });

  return (
    <View
      accessible
      className="min-h-[58px] flex-row items-center gap-3 rounded-lg border border-border bg-surf px-3 py-2"
    >
      <View className="min-w-0 flex-1 gap-0.5">
        <Text className="font-sans-black">{item.text}</Text>
        <Text className="font-sans text-xs text-muted">
          {t('ui.source', { source: item.source })}
        </Text>
      </View>
      <View className="rounded-full bg-crystal px-2 py-[5px]">
        <Text className="font-sans-black text-sm text-crystal-ink">{count}</Text>
      </View>
    </View>
  );
}
