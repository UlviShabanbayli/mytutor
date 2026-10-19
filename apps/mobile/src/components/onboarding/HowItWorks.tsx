import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui';
import { HexTile } from './HexTile';

const STEPS = ['1', '2', '3'] as const;

/** The three steps of linking a parent to a child, numbered in small hexagons. */
export function HowItWorks() {
  const { t } = useTranslation();

  return (
    <View className="gap-2.5 rounded-xl border border-border bg-surf px-3.5 py-3">
      <Text variant="overline" tone="muted" className="text-xs">
        {t('onboarding.parentStart.howTitle')}
      </Text>
      {STEPS.map((n) => (
        <View key={n} className="flex-row items-start gap-2.5">
          <HexTile size={28} fill="honey">
            <Text className="font-sans-black text-sm text-on-honey">{n}</Text>
          </HexTile>
          <Text className="min-w-0 flex-1 pt-1 text-sm">
            {t(`onboarding.parentStart.steps.${n}`)}
          </Text>
        </View>
      ))}
    </View>
  );
}
