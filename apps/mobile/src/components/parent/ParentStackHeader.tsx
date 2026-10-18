import { router } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { IconButton, Text } from '@/components/ui';
import { ParentChip } from './ParentChip';

type ParentStackHeaderProps = {
  title: string;
  subtitle?: string;
  /** `close` for a flow's last step (design: the pending screen). */
  leading?: 'back' | 'close';
  onLeading?: () => void;
};

/** Header of pushed parent screens: back (or close), a 20pt title, the "Valideyn" chip. */
export function ParentStackHeader({
  title,
  subtitle,
  leading = 'back',
  onLeading,
}: ParentStackHeaderProps) {
  const { t } = useTranslation();
  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/parent/kids'));

  return (
    <View className="-ml-3 flex-row items-center gap-1">
      <IconButton
        icon={leading}
        accessibilityLabel={leading === 'back' ? t('common.back') : t('common.close')}
        onPress={onLeading ?? goBack}
      />
      <View className="min-w-0 flex-1 gap-px">
        <Text variant="heading" className="font-display-black" numberOfLines={2}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="caption" tone="muted" numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <ParentChip />
    </View>
  );
}
