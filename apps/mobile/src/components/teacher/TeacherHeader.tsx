import type { ReactNode } from 'react';
import { router } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { IconButton, Text } from '@/components/ui';
import { TeacherRoleChip } from './TeacherRoleChip';

type TeacherHeaderProps = {
  title: string;
  subtitle?: string;
  /** `close` for a task opened from another screen (Tapşırıq ver). */
  leading?: 'back' | 'close';
  /** Extra controls before the role chip. */
  actions?: ReactNode;
  onLeave?: () => void;
};

/** Header of pushed teacher screens: back or close, 20pt title, subtitle, role chip. */
export function TeacherHeader({
  title,
  subtitle,
  leading = 'back',
  actions,
  onLeave,
}: TeacherHeaderProps) {
  const { t } = useTranslation();
  const leave =
    onLeave ?? (() => (router.canGoBack() ? router.back() : router.replace('/teacher/classes')));

  return (
    <View className="flex-row items-center gap-1.5 pb-2 pl-1 pr-4 pt-2">
      <IconButton
        icon={leading}
        accessibilityLabel={leading === 'back' ? t('common.back') : t('common.close')}
        onPress={leave}
      />
      <View className="min-w-0 flex-1 gap-0.5">
        <Text variant="heading" className="font-display-black" numberOfLines={2}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="caption" tone="muted" numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {actions}
      <TeacherRoleChip />
    </View>
  );
}
