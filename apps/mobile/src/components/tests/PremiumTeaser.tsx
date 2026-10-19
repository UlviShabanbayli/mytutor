import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { StatusPill, Text } from '@/components/ui';

/** A calm lock for the premium step-by-step analysis; it never blocks the result itself. */
export function PremiumTeaser() {
  const { t } = useTranslation();
  return (
    <View className="flex-row items-center gap-2.5 rounded-lg border border-dashed border-border px-3 py-2.5">
      <Text variant="caption" tone="muted" className="flex-1 font-sans">
        {t('study.result.premium')}
      </Text>
      <StatusPill kind="premium" label={t('study.result.premiumPill')} />
    </View>
  );
}
