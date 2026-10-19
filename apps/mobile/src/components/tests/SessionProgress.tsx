import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ProgressBar, Text } from '@/components/ui';

type SessionProgressProps = {
  /** 0-based index of the current question. */
  index: number;
  total: number;
};

/** A thick honey bar for the share of the test reached and the count "4/10". */
export function SessionProgress({ index, total }: SessionProgressProps) {
  const { t } = useTranslation();
  const label = t('session.progress', { current: index + 1, total });

  return (
    <View className="flex-1 flex-row items-center gap-2">
      <ProgressBar
        value={total ? (index + 1) / total : 0}
        accessibilityLabel={label}
        className="h-3 flex-1"
      />
      <Text
        accessibilityElementsHidden
        importantForAccessibility="no"
        className="min-w-12 pr-2 text-right font-sans-black text-sm text-muted"
      >
        {`${index + 1}/${total}`}
      </Text>
    </View>
  );
}
