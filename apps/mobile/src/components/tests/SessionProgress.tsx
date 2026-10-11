import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ProgressBar, Text } from '@/components/ui';

type SessionProgressProps = {
  title: string;
  /** 0-based index of the current question. */
  index: number;
  total: number;
};

/** The test's title, "4 / 10" and a thin bar of questions answered so far. */
export function SessionProgress({ title, index, total }: SessionProgressProps) {
  const { t } = useTranslation();
  const label = t('session.progress', { current: index + 1, total });

  return (
    <View className="flex-1 gap-1.5">
      <View className="flex-row items-baseline justify-between gap-2">
        <Text variant="label" tone="muted" numberOfLines={1} className="flex-1">
          {title}
        </Text>
        <Text className="font-sans-black text-sm">{`${index + 1} / ${total}`}</Text>
      </View>
      <ProgressBar value={total ? (index + 1) / total : 0} accessibilityLabel={label} />
    </View>
  );
}
