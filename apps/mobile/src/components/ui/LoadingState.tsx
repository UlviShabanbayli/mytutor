import { ActivityIndicator, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useThemeColors } from '@/theme';
import { Text } from './Text';

type LoadingStateProps = {
  message?: string;
};

export function LoadingState({ message }: LoadingStateProps) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const label = message ?? t('common.loading');

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      className="flex-1 items-center justify-center gap-3 py-12"
    >
      <ActivityIndicator size="large" color={colors.primary} />
      <Text tone="muted">{label}</Text>
    </View>
  );
}
