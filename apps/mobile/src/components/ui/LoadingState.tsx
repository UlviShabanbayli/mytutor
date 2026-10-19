import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Mascot } from '../mascot/Mascot';
import { Text } from './Text';

type LoadingStateProps = {
  message?: string;
};

/** The flying mascot with "Nektar yığıram…" (shown for waits longer than a moment). */
export function LoadingState({ message }: LoadingStateProps) {
  const { t } = useTranslation();
  const label = message ?? t('common.loading');

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      className="flex-1 items-center justify-center gap-3 py-12"
    >
      <Mascot moment="loading" behavior="loading" size={120} decorative />
      <Text tone="muted" className="font-sans-semibold">
        {label}
      </Text>
    </View>
  );
}
