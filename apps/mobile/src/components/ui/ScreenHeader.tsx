import type { ReactNode } from 'react';
import { router } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { IconButton } from './IconButton';
import { Text } from './Text';

type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  /** Right side: one or two icon buttons. */
  actions?: ReactNode;
};

/** Header for stacked (non-tab) screens: back button, title, optional actions. */
export function ScreenHeader({ title, subtitle, actions }: ScreenHeaderProps) {
  const { t } = useTranslation();

  return (
    <View className="-ml-3 flex-row items-center gap-1">
      <IconButton icon="back" accessibilityLabel={t('common.back')} onPress={router.back} />
      <View className="flex-1">
        <Text variant="heading" numberOfLines={2}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="caption" tone="muted">
            {subtitle}
          </Text>
        ) : null}
      </View>
      {actions}
    </View>
  );
}
