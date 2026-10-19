import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, Text } from '@/components/ui';
import type { PlanFeature } from '@/features/me/types';
import { cn } from '@/lib/cn';

type PlanTableProps = { features: PlanFeature[] };

/** Free vs Premium side by side: checks, crosses and words, never color alone. */
export function PlanTable({ features }: PlanTableProps) {
  const { t } = useTranslation();
  const cell = (value: PlanFeature['free'] | PlanFeature['premium'], premium: boolean) => {
    if (value === 'yes') return <Icon name="check" size={16} color="ok" />;
    if (value === 'no') return <Icon name="x" size={16} color="lock-ink" />;
    return (
      <Text
        className={cn(
          'text-center font-sans-black text-xs',
          premium ? 'text-honey-text' : 'text-muted',
        )}
      >
        {t(`me.subscription.values.${value}`)}
      </Text>
    );
  };

  return (
    <View
      accessibilityLabel={t('me.subscription.tableLabel')}
      className="rounded-[18px] border border-border bg-surf px-3 py-1"
    >
      <View
        className="min-h-10 flex-row items-center gap-1.5"
        importantForAccessibility="no-hide-descendants"
      >
        <Text variant="overline" tone="muted" className="flex-[1.5]">
          {t('me.subscription.feature')}
        </Text>
        <Text className="flex-1 text-center font-sans-black text-sm">
          {t('me.subscription.free')}
        </Text>
        <View className="flex-1 items-center">
          <View className="h-[26px] flex-row items-center gap-1 rounded-full bg-spot px-2">
            <Icon name="star" size={12} color="honey" />
            <Text className="font-sans-black text-xs text-honey">
              {t('me.subscription.premium')}
            </Text>
          </View>
        </View>
      </View>
      {features.map((f) => {
        const name = t(`me.subscription.features.${f.id}`);
        return (
          <View
            key={f.id}
            accessible
            accessibilityLabel={t('me.subscription.cellLabel', {
              feature: name,
              free: t(`me.subscription.values.${f.free}`),
              premium: t(`me.subscription.values.${f.premium}`),
            })}
            className="min-h-10 flex-row items-center gap-1.5 border-t border-border py-1"
          >
            <Text className="flex-[1.5] font-sans-semibold text-sm">{name}</Text>
            <View className="flex-1 items-center">{cell(f.free, false)}</View>
            <View className="flex-1 items-center">{cell(f.premium, true)}</View>
          </View>
        );
      })}
    </View>
  );
}
